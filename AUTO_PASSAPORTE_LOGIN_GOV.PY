import os
import io
import tkinter as tk
from tkinter import messagebox
import pandas as pd
import openpyxl
from openpyxl import load_workbook
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import warnings
import time
import subprocess
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from datetime import datetime

import undetected_chromedriver as uc


# Configurações
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
SPREADSHEET_IDS = {
    'F': '10_beB24nkw37BsWQaCrS2lrFspcAarA1',
    'M': '1hGsycXU1JM-saNrluhbHumtsxj6vMRFm'
}
RANGES = {
    'F': [
        '2025_Matricula',
        'EF_Geral_Alfabetica_31122024'
    ],
    'M': [
        '2025_Matriculas',
        'EM_Geral_Alfabetica_31122024'
    ]
}

def authenticate():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return creds

def download_file(service, file_id):
    request = service.files().get_media(fileId=file_id)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
        print(f"Download {int(status.progress() * 100)}%.")
    fh.seek(0)
    return fh

def search_passport(passport, service):
    prefix = passport[0]
    file_id = SPREADSHEET_IDS.get(prefix)
    sheet_names = RANGES.get(prefix)

    if not file_id or not sheet_names:
        return "Planilha não encontrada para o formato do passaporte."

    file_handle = download_file(service, file_id)

    for sheet_name in sheet_names:
        print(f"Procurando na aba {sheet_name}...")
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            file_handle.seek(0)
            try:
                df = pd.read_excel(file_handle, sheet_name=sheet_name, engine='openpyxl')
            except Exception as e:
                print(f"Erro ao ler a aba {sheet_name}: {e}. Pulando para a próxima.")
                continue

        expected_cols = ['Unnamed: 1', 'Unnamed: 2', 'Unnamed: 3', 'Unnamed: 4', 'Unnamed: 5', 'Unnamed: 6',
                         'Unnamed: 8', 'Unnamed: 9', 'Unnamed: 10']
        if not all(col in df.columns for col in expected_cols):
            print(f"Colunas principais não encontradas na aba '{sheet_name}'. Pulando...")
            continue

        passaporte_col = df.columns.get_loc('Unnamed: 1')
        nome_col = df.columns.get_loc('Unnamed: 2')
        ra_col = df.columns.get_loc('Unnamed: 3')
        rg_col = df.columns.get_loc('Unnamed: 4')
        telefone_col = df.columns.get_loc('Unnamed: 5')
        cidade_col = df.columns.get_loc('Unnamed: 6')
        data_matric_col = df.columns.get_loc('Unnamed: 8')
        serie_concluida_col = df.columns.get_loc('Unnamed: 9')
        serie_matricular_col = df.columns.get_loc('Unnamed: 10')
            
        prof_disciplina_col = -1
        observacao_col = -1

        if prefix == 'M':
            if 'Unnamed: 23' in df.columns: prof_disciplina_col = df.columns.get_loc('Unnamed: 23')
            if 'Unnamed: 34' in df.columns: observacao_col = df.columns.get_loc('Unnamed: 34')
        else:
            if 'Unnamed: 18' in df.columns: prof_disciplina_col = df.columns.get_loc('Unnamed: 18')
            if 'Unnamed: 25' in df.columns: observacao_col = df.columns.get_loc('Unnamed: 25')

        df[df.columns[passaporte_col]] = df[df.columns[passaporte_col]].astype(str).str.strip()
        result_row = df[df.iloc[:, passaporte_col] == passport]
        
        if not result_row.empty:
            result = {
                'Passaporte': result_row.iloc[0, passaporte_col],
                'Nome': result_row.iloc[0, nome_col],
                'RA': result_row.iloc[0, ra_col],
                'RG': result_row.iloc[0, rg_col],
                'Telefone': result_row.iloc[0, telefone_col],
                'Cidade': result_row.iloc[0, cidade_col],
                'Série Concluída': result_row.iloc[0, serie_concluida_col],
                'Data Matricula': result_row.iloc[0, data_matric_col],
                'Série a ser Matriculado': result_row.iloc[0, serie_matricular_col],
                'Prof. 1ª Disciplina': result_row.iloc[0, prof_disciplina_col] if prof_disciplina_col != -1 else '',
                'Observação': result_row.iloc[0, observacao_col] if observacao_col != -1 else ''
            }
            return result

    return "Passaporte não encontrado."

def extract_site_data(ra_number):
    options = webdriver.ChromeOptions()
    # options.add_argument("--start-maximized")
    try:
        # Força o undetected-chromedriver a usar o driver para a versão 137,
        # que é a versão do seu navegador atual.
        driver = uc.Chrome(options=options)
    except Exception as e:
        messagebox.showerror("Erro de Inicialização do Navegador", 
                             f"Não foi possível iniciar o navegador. Erro: {e}")
        print(f"Erro ao iniciar undetected_chromedriver: {e}")
        return None

    with open('login_credentials.json') as f:
        credentials = json.load(f)
    username = credentials['username']
    password = credentials['password']

    site_data = {}
    wait = WebDriverWait(driver, 6) # Wait geral longo

    try:
        print("Navegando para https://sed.educacao.sp.gov.br/")
        driver.get('https://sed.educacao.sp.gov.br/')
        
        print("Clicando em 'Entrar com GOV.BR'...")
        govbr_login_button = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="div-login"]/div[2]/div[2]')))
        govbr_login_button.click()
        
        print("Aguardando redirecionamento para o GOV.BR...")
        wait.until(EC.url_contains('sso.acesso.gov.br'))
        time.sleep(3)

        print("Preenchendo CPF/usuário no GOV.BR...")
        account_id_field = wait.until(EC.presence_of_element_located((By.XPATH, '//*[@id="accountId"]')))
        account_id_field.send_keys(username)
        enter_account_id_button = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="enter-account-id"]')))
        enter_account_id_button.click()
        time.sleep(3)

        print("Aguardando usuário resolver o CAPTCHA...")
        messagebox.showinfo("Ação Necessária: Resolva o CAPTCHA",
                            "Por favor, no navegador, resolva o CAPTCHA e clique em 'Continuar'.\n\n"
                            "**Após resolver o CAPTCHA e a página pedir a senha, clique em 'OK' nesta mensagem.**")
        
        print("Preenchendo a senha no GOV.BR...")
        password_field = wait.until(EC.presence_of_element_located((By.XPATH, '//*[@id="password"]')))
        password_field.send_keys(password)
        submit_button = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="submit-button"]')))
        submit_button.click()
        
        print("Aguardando redirecionamento de volta para a SED...")
        wait.until(EC.url_contains('sed.educacao.sp.gov.br/'))

        # Verificar se a URL atual é a esperada para a ficha do aluno
        expected_url = 'https://sed.educacao.sp.gov.br/NCA/FichaAluno/Index'
        if driver.current_url != expected_url:
            print(f"URL atual ({driver.current_url}) não é a esperada. Navegando para {expected_url}...")
            driver.get(expected_url)
            time.sleep(2) # Dar tempo para a página carregar

        print("Logado na SED. Verificando a existência de pop-ups...")
        try:
            popup_wait = WebDriverWait(driver, 4)
            close_popup_button = popup_wait.until(
                EC.element_to_be_clickable((By.XPATH, '//*[@id="btnFecharModalAlert"]'))
            )
            print("Pop-up de alerta encontrado. Tentando fechar...")
            driver.execute_script("arguments[0].click();", close_popup_button)
            print("Pop-up fechado com sucesso.")
            time.sleep(1)
        except TimeoutException:
            print("Nenhum pop-up de alerta encontrado. Prosseguindo...")
        except Exception as e:
            print(f"Ocorreu um erro ao tentar fechar o pop-up: {e}. Tentando prosseguir mesmo assim.")

        # Adicionar lógica para lidar com o pop-up VLibras
        try:
            vlibras_popup = WebDriverWait(driver, 3).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'img.vp-access-button'))
            )
            print("Pop-up VLibras encontrado. Tentando ocultar...")
            driver.execute_script("arguments[0].style.display = 'none';", vlibras_popup)
            print("Pop-up VLibras ocultado com sucesso.")
            time.sleep(1)
        except TimeoutException:
            print("Nenhum pop-up VLibras encontrado. Prosseguindo...")
        except Exception as e:
            print(f"Ocorreu um erro ao tentar ocultar o pop-up VLibras: {e}. Tentando prosseguir mesmo assim.")

        print("Pesquisando 'ficha do aluno' no menu...")

        try:
            print("Localizando caixa de pesquisa do menu...")
            search_box = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="decorMenuFilterTxt"]')))
            print("Caixa de pesquisa localizada, enviando texto...")
            search_box.send_keys('ficha do aluno')
            search_box.send_keys(Keys.ENTER)
            time.sleep(3)
        except Exception as e:
            print(f"Erro ao localizar/enviar texto na caixa de pesquisa do menu: {e}")
            raise

        try:
            print("Localizando dropdown do menu de pesquisa...")
            dropdown_menu = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="Pesquisa"]/div[1]/div[2]/div/div/button/div/div/div')))
            print("Dropdown localizado, clicando...")
            dropdown_menu.click()
        except Exception as e:
            print(f"Erro ao localizar/clicar no dropdown do menu de pesquisa: {e}")
            raise

        try:
            print("Localizando opção de RA no dropdown...")
            ra_option = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="bs-select-1-0"]/span')))
            print("Opção de RA localizada, clicando...")
            ra_option.click()
            time.sleep(1) # Adicionado um pequeno atraso para o campo de RA carregar
        except Exception as e:
            print(f"Erro ao localizar/clicar na opção de RA: {e}")
            raise

        try:
            print("Localizando campo para digitar o RA do aluno...")
            search_box_RAaluno = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="txtRa"]')))
            clean_ra_number = str(ra_number).replace('-', '')[:-1]
            search_box_RAaluno.send_keys(clean_ra_number)
            search_box_Pesquisar = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@id="btnPesquisar"]')))
            print("Clicando no botão pesquisar RA...")
            search_box_Pesquisar.click()
            time.sleep(3)
        except Exception as e:
            print(f"Erro ao localizar/preencher/clicar no campo de RA do aluno: {e}")
            raise

        try:
            search_botao_editar = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'i.icone-tabela-editar[title="Editar"]')))
            search_botao_editar.click()
        except Exception as e:
            messagebox.showerror("Erro Selenium", f"Não foi possível encontrar o botão 'Editar' na SED. Verifique se o RA está correto ou se a página carregou como esperado. Erro: {e}")
            driver.quit()
            return None

        time.sleep(3)

        try: site_data['Endereco'] = driver.find_element(By.XPATH, '//*[@id="Endereco"]').get_attribute('value')
        except: print('Erro ao encontrar campo de endereço.')
        try: site_data['EnderecoNR'] = driver.find_element(By.XPATH, '//*[@id="EnderecoNR"]').get_attribute('value')
        except: print('Erro ao encontrar número da casa.')
        try: site_data['CEP'] = driver.find_element(By.CSS_SELECTOR, 'input.form-control.cep').get_attribute('value')
        except: print('Erro ao encontrar campo de CEP.')
        try: site_data['Data de Nascimento'] = driver.find_element(By.XPATH, '//*[@id="DtNascimento"]').get_attribute('value')
        except: print('Erro ao encontrar campo de Data de Nascimento.')
        try: site_data['Email'] = driver.find_element(By.XPATH, '//*[@id="Email"]').get_attribute('value')
        except: print('Erro ao encontrar campo de e-mail.')

    except Exception as e:
        messagebox.showerror("Erro de Automação", f"Ocorreu um erro durante o processo de automação da SED: {e}")
        print(f"Erro geral na extração de dados do site: {e}")
        site_data = None

    finally:
        driver.quit()
        return site_data

# O restante do código (update_excel, clear_form, populate_form, etc.) permanece inalterado.
# Colei abaixo por completude.

def update_excel(result, site_data):
    wb = load_workbook('Passaporte_Geral_2024.xlsx')
    ws = wb.active

    ws['K3'] = result.get('Passaporte', '') # type: ignore
    ws['L4'] = result.get('Data Matricula', '') # type: ignore
    ws['C3'] = result.get('Nome', '') # type: ignore
    ws['J4'] = result.get('RA', '') # type: ignore
    ws['G4'] = result.get('RG', '') # type: ignore
    ws['C6'] = result.get('Telefone', '') # type: ignore
    ws['I5'] = result.get('Cidade', '') # type: ignore
    ws['D25'] = result.get('Série Concluída', '') # type: ignore
    ws['G25'] = result.get('Série a ser Matriculado', '') # type: ignore
    ws['D26'] = result.get('Observação', '') # type: ignore

    if site_data:
        endereco_completo = f"{site_data.get('Endereco', '')}, {site_data.get('EnderecoNR', '')}"
        ws['C5'] = endereco_completo # type: ignore
        ws['L5'] = site_data.get('CEP', '') # type: ignore
        ws['D4'] = site_data.get('Data de Nascimento', '') # type: ignore
        ws['J6'] = site_data.get('Email', '') # type: ignore

    wb.save('Passaporte_Geral_2024.xlsx')

    try:
        if os.name == 'nt':
            os.startfile('Passaporte_Geral_2024.xlsx')
        elif os.name == 'posix':
            subprocess.call(('open', 'Passaporte_Geral_2024.xlsx'))
    except Exception as e:
        print(f"Erro ao abrir o arquivo: {e}")

def clear_form(ws):
    ws['C6'] = '' # type: ignore
    ws['B7'] = '' # type: ignore
    ws['F7'] = '' # type: ignore
    ws['M7'] = '' # type: ignore
    ws['C8'] = '' # type: ignore
    ws['C9'] = '' # type: ignore
    ws['O9'] = 'Sim( )' # type: ignore
    ws['P9'] = 'Não( )' # type: ignore
    ws['G8'] = '( )' # type: ignore
    ws['I8'] = '( )' # type: ignore
    ws['K8'] = '( )' # type: ignore
    ws['M8'] = '( )' # type: ignore
    ws['O8'] = '( )' # type: ignore
    ws['Q8'] = '( )' # type: ignore
    ws['I23']= ' ' # type: ignore
    ws['N23']= ' ' # type: ignore
    ws['G9'] = '' # type: ignore
    ws['C9'] = '' # type: ignore
    ws['C10'] = '' # type: ignore
    ws['G10'] = '' # type: ignore
    ws['O10'] = '' # type: ignore
    ws['Q10'] = '' # type: ignore
    ws['J14'] = '' # type: ignore
    ws['K13'] = '( )' # type: ignore
    ws['Q13'] = '( )' # type: ignore
    ws['B19'] = '' # type: ignore
    ws['O19'] = '' # type: ignore
    ws['C20'] = '' # type: ignore
    ws['M20'] = '( )' # type: ignore
    ws['O20'] = '( )' # type: ignore
    ws['B21'] = '' # type: ignore
    ws['F21'] = '' # type: ignore
    ws['M21'] = '' # type: ignore
    ws['F22'] = '' # type: ignore
    ws['M22'] = '' # type: ignore
    ws['C23'] = '' # type: ignore
    ws['I25'] = ' ' # type: ignore
    ws['K25'] = '( )' # type: ignore
    ws['M25'] = '( )' # type: ignore
    ws['O25'] = '( )' # type: ignore
    ws['Q25'] = '( )' # type: ignore
    ws["Q11"] = '( )' # type: ignore
    ws['Q12'] = '( )' # type: ignore
    ws['I26'] = ' ' # type: ignore
    ws['K26'] = '( )' # type: ignore
    ws['M26'] = '( )' # type: ignore
    ws['O26'] = '( )' # type: ignore
    ws['J30'] = '( )' # type: ignore
    ws['L30'] = '( )' # type: ignore
    ws['K15'] = '( )' # type: ignore
    ws['M15'] = '( )' # type: ignore
    ws['M16'] = '( )' # type: ignore
    ws['K17'] = '( )' # type: ignore
    ws['M17'] = '( )' # type: ignore
    ws['I31'] = 'Não( )' # type: ignore
    ws['I32'] = 'Sim( )' # type: ignore
    ws['I33'] = '( )' # type: ignore
    ws['I34'] = '( )' # type: ignore
    ws['I35'] = '( )' # type: ignore
    ws['I37'] = '( )' # type: ignore
    ws['I38'] = '( )' # type: ignore
    ws['A40'] = '( )' # type: ignore
    ws['A41'] = '( )' # type: ignore
    ws['A42'] = '( )' # type: ignore
    ws['A43'] = '( )' # type: ignore
    ws['D40'] = '( )' # type: ignore
    ws['D41'] = '( )' # type: ignore
    ws['D42'] = '( )' # type: ignore
    ws['D43'] = '( )' # type: ignore
    ws['I40'] = '( )' # type: ignore
    ws['I41'] = '( )' # type: ignore
    ws['I42'] = '( )' # type: ignore
    ws['M40'] = '( )' # type: ignore
    ws['M41'] = '( )' # type: ignore
    ws['M42'] = '( )' # type: ignore
    ws['A45'] = '( )' # type: ignore

def calcular_idade(data_nascimento):
    try:
        data_nasc = datetime.strptime(data_nascimento, "%d/%m/%Y")
        hoje = datetime.now()
        idade = hoje.year - data_nasc.year - ((hoje.month, hoje.day) < (data_nasc.month, data_nasc.day))
        return idade
    except ValueError:
        return "Formato inválido"

def populate_form(form_data):
    wb = load_workbook('FICHA_DE_MATRÍCULA_2024.xlsx')
    ws = wb.active
    clear_form(ws)

    ws['C6'] = form_data.get('Nome', '') # type: ignore
    ws['B7'] = form_data.get('RG', '') # type: ignore
    ws['F7'] = form_data.get('CPF', '') # type: ignore
    ws['M7'] = form_data.get('RA', '') # type: ignore
    ws['C8'] = form_data.get('Estado Civil', '') # type: ignore

    data_nascimento = form_data.get('Nascimento', '')
    if data_nascimento:
        idade = calcular_idade(data_nascimento)
        ws['C9'] = idade # type: ignore
    else:
        ws['C9'] = "Data Nasc. Inválida" # type: ignore
        
    ws['I23'] = form_data.get('Profissão', '') # type: ignore
    ws['N23'] = form_data.get('local trabalho', '') # type: ignore

    cor_raca = form_data.get('Cor/raça', '')
    ws['G8'] = '(X)' if cor_raca == 'Branco' else '( )' # type: ignore
    ws['I8'] = '(X)' if cor_raca == 'Preto' else '( )' # type: ignore
    ws['K8'] = '(X)' if cor_raca == 'Pardo' else '( )' # type: ignore
    ws['M8'] = '(X)' if cor_raca == 'Amarelo' else '( )' # type: ignore
    ws['O8'] = '(X)' if cor_raca == 'Indígena' else '( )' # type: ignore
    ws['Q8'] = '(X)' if cor_raca == 'Outra' else '( )' # type: ignore

    ws['G9'] = form_data.get('Nome da Mãe', '') # type: ignore
    gemeo_sim = form_data.get('Gêmeo', '( )')
    ws['O9'] = '(X)' if gemeo_sim == "Sim" else '( )' # type: ignore
    ws['P9'] = '(X)' if gemeo_sim == "Não" else '( )' # type: ignore

    ws['C10'] = form_data.get('Nascimento', '') # type: ignore
    ws['G10'] = form_data.get('Município', '') # type: ignore
    ws['O10'] = form_data.get('UF', '') # type: ignore
    ws['Q10'] = form_data.get('País', '') # type: ignore

    if form_data.get('Opção de Itinerário') == 'Ciências Naturais/Matemática':
        ws['K13'] = '(X)' # type: ignore
        ws['Q13'] = '( )' # type: ignore
    else:
        ws['Q13'] = '(X)' # type: ignore
        ws['K13'] = '( )' # type: ignore

    ws['B19'] = form_data.get('Endereço', '') # type: ignore
    ws['O19'] = form_data.get('Número', '') # type: ignore
    ws['C20'] = form_data.get('Bairro', '') # type: ignore

    if form_data.get('Urbana/Rural') == 'Urbana':
        ws['M20'] = '( X )' # type: ignore
        ws['O20'] = '(  )' # type: ignore
    elif form_data.get('Urbana/Rural') == 'Rural':
        ws['M20'] = '(  )' # type: ignore
        ws['O20'] = '( X )' # type: ignore
    else:
        ws['M20'] = '(  )' # type: ignore
        ws['O20'] = '(  )' # type: ignore

    ws['B21'] = form_data.get('CEP', '') # type: ignore
    ws['F21'] = form_data.get('Cidade', '') # type: ignore
    ws['M21'] = form_data.get('UF_Cidade', '') # type: ignore
    ws['F22'] = form_data.get('Telefone Celular', '') # type: ignore
    ws['M22'] = form_data.get('Telefone Recado', '') # type: ignore
    ws['C23'] = form_data.get('Email', '') # type: ignore

    nivel_ensino = form_data.get('Requer Matrícula no', '')

    if nivel_ensino == 'Ensino Fundamental':
        ws['Q11'] = '(X)' # type: ignore
        ws['Q12'] = '( )' # type: ignore
        ws['K26'], ws['M26'], ws['O26'] = '( )', '( )', '( )' # type: ignore
        termo = form_data.get('Termo/Série', '')
        if termo == '1º Termo': ws['K25'] = '(X)' # type: ignore
        elif termo == '2º Termo': ws['M25'] = '(X)' # type: ignore
        elif termo == '3º Termo': ws['O25'] = '(X)' # type: ignore
        elif termo == '4º Termo': ws['Q25'] = '(X)' # type: ignore
    elif nivel_ensino == 'Ensino Médio':
        ws['Q12'] = '(X)' # type: ignore
        ws['Q11'] = '( )' # type: ignore
        ws['K25'], ws['M25'], ws['O25'], ws['Q25'] = '( )', '( )', '( )', '( )' # type: ignore
        serie = form_data.get('Termo/Série', '')
        if serie == '1ª Série': ws['K26'] = '(X)' # type: ignore
        elif serie == '2ª Série': ws['M26'] = '(X)' # type: ignore
        elif serie == '3ª Série': ws['O26'] = '(X)' # type: ignore

    if form_data.get('Ensino Religioso') == 'Sim':
        ws['J30'], ws['L30'] = '(X)', '( )' # type: ignore
    else:
        ws['L30'], ws['J30'] = '(X)', '( )' # type: ignore

    if form_data.get('Estudou nesta U.E.') == 'Sim':
        ws['K15'], ws['M15'] = '(X)', '( )' # type: ignore
    else:
        ws['M15'], ws['K15'] = '(X)', '( )' # type: ignore

    if form_data.get('Aproveitamento de Estudos') == 'Sim':
        ws['K16'], ws['M16'] = '(X)', '( )' # type: ignore
    else:
        ws['M16'], ws['K16'] = '(X)', '( )' # type: ignore

    if form_data.get('Portador de necessidades ou PCD') == 'Sim':
        ws['K17'], ws['M17'] = '(X)', '( )' # type: ignore
    else:
        ws['M17'], ws['K17'] = '(X)', '( )' # type: ignore

    ws['J14'] = form_data.get('Se sim, qual', '') # type: ignore

    ws['A40'] = '(X)' if form_data['Doc_RG'] else '( )' # type: ignore
    ws['A41'] = '(X)' if form_data['Doc_CPF'] else '( )' # type: ignore
    ws['A42'] = '(X)' if form_data['Foto'] else '( )' # type: ignore
    ws['A43'] = '(X)' if form_data['Requerimento de Matrícula'] else '( )' # type: ignore
    ws['D40'] = '(X)' if form_data['Histórico Escolar'] else '( )' # type: ignore
    ws['D41'] = '(X)' if form_data['Comprovante de Endereço'] else '( )' # type: ignore
    ws['D42'] = '(X)' if form_data['Carteira de Vacinação'] else '( )' # type: ignore
    ws['D43'] = '(X)' if form_data['Certidão de Nascimento'] else '( )' # type: ignore
    ws['I40'] = '(X)' if form_data['Ficha de Aproveitamento de Estudos'] else '( )' # type: ignore
    ws['I41'] = '(X)' if form_data['Relatório Médico'] else '( )' # type: ignore
    ws['I42'] = '(X)' if form_data['Declaração de Transferência'] else '( )' # type: ignore
    ws['M40'] = '(X)' if form_data['Requerimento de Transferência'] else '( )' # type: ignore
    ws['M41'] = '(X)' if form_data['Declaração de Matrícula'] else '( )' # type: ignore
    ws['M42'] = '(X)' if form_data['Boletim Escolar'] else '( )' # type: ignore
    
    if form_data['Certificado de Conclusão']:
        ws['A45'] = datetime.now().strftime("%d/%m/%Y") # type: ignore
    else:
        ws['A45'] = '( )' # type: ignore

    wb.save('FICHA_DE_MATRÍCULA_2024.xlsx')
  

def enviar(form_window):
    form_data = {
        'Nome': nome_entry.get(), 'RG': rg_entry.get(), 'CPF': cpf_entry.get(),
        'Nascimento': nascimento_entry.get(), 'RA': ra_entry.get(),
        'Estado Civil': estado_civil_entry.get(), 'Cor/raça': cor_var.get(),
        'Nome da Mãe': nome_mae_entry.get(), 'Gêmeo': gemeo_var.get(),
        'Município': municipio_entry.get(), 'UF': uf_entry.get(), 'País': pais_entry.get(),
        'Opção de Itinerário': itinerario_var.get(), 'Endereço': endereco_entry.get(),
        'Número': numero_entry.get(), 'Bairro': bairro_entry.get(),
        'Urbana/Rural': zona_var.get(), 'CEP': cep_entry.get(), 'Cidade': cidade_entry.get(),
        'UF_Cidade': uf_cidade_entry.get(), 'Telefone Celular': telefone_celular_entry.get(),
        'Telefone Recado': telefone_recado_entry.get(), 'Email': email_entry.get(),
        'Profissão': profissao_entry.get(), 'local trabalho': local_trabalho_entry.get(),
        'Requer Matrícula no': nivel_var.get(), 'Termo/Série': serie_var.get(),
        'Ensino Religioso': ensino_religioso_var.get(), 'Estudou nesta U.E.': estudou_ue_var.get(),
        'Aproveitamento de Estudos': aproveitamento_var.get(),
        'Portador de necessidades ou PCD': necessidades_var.get(),
        'Se sim, qual': necessidade_qual_entry.get(),
        'Doc_RG': doc_rg_var.get(), 'Doc_CPF': doc_cpf_var.get(), 'Foto': doc_foto_var.get(),
        'Requerimento de Matrícula': doc_requerimento_var.get(),
        'Histórico Escolar': doc_historico_var.get(),
        'Comprovante de Endereço': doc_comprovante_var.get(),
        'Carteira de Vacinação': doc_vacinacao_var.get(),
        'Certidão de Nascimento': doc_certidao_var.get(),
        'Ficha de Aproveitamento de Estudos': doc_aproveitamento_var.get(),
        'Relatório Médico': doc_relatorio_var.get(),
        'Declaração de Transferência': doc_transferencia_var.get(),
        'Requerimento de Transferência': doc_req_transferencia_var.get(),
        'Declaração de Matrícula': doc_decl_matricula_var.get(),
        'Boletim Escolar': doc_boletim_var.get(),
        'Certificado de Conclusão': doc_certificado_var.get()
    }
    populate_form(form_data)
    messagebox.showinfo("Sucesso", "Ficha preenchida com sucesso!")
    try:
        if os.name == 'nt': os.startfile('FICHA_DE_MATRÍCULA_2024.xlsx')
        else: subprocess.call(('open', 'FICHA_DE_MATRÍCULA_2024.xlsx'))
    except Exception as e:
        print(f"Erro ao abrir o arquivo: {e}")
    form_window.withdraw()
    if 'main_window_instance' in globals() and main_window_instance.winfo_exists():
        main_window_instance.deiconify()

def main_window():
    global main_window_instance
    main_window_instance = tk.Tk()
    main_window_instance.title("Sistema de Matrícula")
    main_window_instance.geometry("800x600")

    def on_search_click():
        passport = passport_entry.get().strip().upper()
        if passport:
            creds = authenticate()
            service = build('drive', 'v3', credentials=creds)
            result = search_passport(passport, service)
            if isinstance(result, dict):
                ra_number = result.get('RA')
                site_data = extract_site_data(ra_number)
                if site_data is not None:
                    update_excel(result, site_data)
                    messagebox.showinfo("Resultado da Pesquisa", f"Passaporte {passport} encontrado e dados preenchidos!")
                else:
                    messagebox.showerror("Erro de Preenchimento", "Ocorreu um erro ao extrair dados da SED. Verifique o log do console.")
            else:
                messagebox.showwarning("Resultado da Pesquisa", result)
        else:
            messagebox.showwarning("Entrada inválida", "Por favor, insira um número de passaporte.")

    def on_form_click():
        main_window_instance.withdraw()
        show_form()

    tk.Label(main_window_instance, text="Número do Passaporte:").pack(pady=10)
    passport_entry = tk.Entry(main_window_instance)
    passport_entry.pack(pady=10)
    tk.Button(main_window_instance, text="Buscar e Preencher Planilha", command=on_search_click).pack(pady=20)
    tk.Button(main_window_instance, text="Preencher Ficha de Matrícula", command=on_form_click).pack(pady=20)

    if os.path.exists("LOGOTIPO_CEEJA.png"):
        logo = tk.PhotoImage(file="LOGOTIPO_CEEJA.png")
        logo_label = tk.Label(main_window_instance, image=logo)
        logo_label.image = logo
        logo_label.pack(pady=10)

    main_window_instance.mainloop()

def show_form():
    form_window = tk.Toplevel()
    form_window.title("Formulário de Matrícula")

    global nome_entry, rg_entry, cpf_entry, ra_entry, estado_civil_entry, cor_var, nome_mae_entry, gemeo_var, nascimento_entry, municipio_entry, uf_entry, pais_entry, itinerario_var, endereco_entry, numero_entry, bairro_entry, zona_var, cep_entry, cidade_entry, uf_cidade_entry, telefone_celular_entry, telefone_recado_entry, email_entry, profissao_entry, local_trabalho_entry, nivel_var, serie_var, ensino_religioso_var, estudou_ue_var, aproveitamento_var, necessidades_var, necessidade_qual_entry, doc_rg_var, doc_cpf_var, doc_foto_var, doc_requerimento_var, doc_historico_var, doc_comprovante_var, doc_vacinacao_var, doc_certidao_var, doc_aproveitamento_var, doc_relatorio_var, doc_transferencia_var, doc_req_transferencia_var, doc_decl_matricula_var, doc_boletim_var, doc_certificado_var

    main_frame = tk.Frame(form_window)
    main_frame.pack(fill="both", expand=True, padx=10, pady=10)
    left_frame = tk.Frame(main_frame)
    left_frame.pack(side="left", fill="both", expand=True, padx=5)
    right_frame = tk.Frame(main_frame)
    right_frame.pack(side="right", fill="both", expand=True, padx=5)

    def create_input_field(parent, row, text):
        tk.Label(parent, text=text).grid(row=row, column=0, sticky='w', pady=2)
        entry = tk.Entry(parent)
        entry.grid(row=row, column=1, sticky='ew', pady=2)
        return entry
    def create_radio_buttons(parent, row, text, var, options):
        tk.Label(parent, text=text).grid(row=row, column=0, sticky='w', pady=2)
        for i, opt in enumerate(options):
            tk.Radiobutton(parent, text=opt, variable=var, value=opt).grid(row=row, column=1 + i, sticky='w')
    def create_option_menu(parent, row, text, var, options):
        tk.Label(parent, text=text).grid(row=row, column=0, sticky='w', pady=2)
        tk.OptionMenu(parent, var, *options).grid(row=row, column=1, sticky='ew', pady=2)
    def create_checkbox_field(parent, row, text):
        tk.Label(parent, text=text).grid(row=row, column=0, sticky='w', pady=2)
        var = tk.IntVar()
        tk.Checkbutton(parent, variable=var).grid(row=row, column=1, sticky='w')
        return var

    row_idx = 0
    nome_entry = create_input_field(left_frame, row_idx, "Nome:")
    row_idx += 1; rg_entry = create_input_field(left_frame, row_idx, "RG:")
    row_idx += 1; cpf_entry = create_input_field(left_frame, row_idx, "CPF:")
    row_idx += 1; ra_entry = create_input_field(left_frame, row_idx, "RA:")
    row_idx += 1; estado_civil_entry = create_input_field(left_frame, row_idx, "Estado Civil:")
    row_idx += 1
    cor_var = tk.StringVar(value="Branco")
    create_option_menu(left_frame, row_idx, "Cor/Raça:", cor_var, ["Branco", "Preto", "Pardo", "Amarelo", "Indígena", "Outra"])
    row_idx += 1; nome_mae_entry = create_input_field(left_frame, row_idx, "Nome da Mãe:")
    row_idx += 1
    gemeo_var = tk.StringVar(value="Não")
    create_radio_buttons(left_frame, row_idx, "Gêmeo:", gemeo_var, ["Sim", "Não"])
    row_idx += 1; nascimento_entry = create_input_field(left_frame, row_idx, "Nascimento (DD/MM/AAAA):")
    row_idx += 1; municipio_entry = create_input_field(left_frame, row_idx, "Município:")
    row_idx += 1; uf_entry = create_input_field(left_frame, row_idx, "UF:")
    row_idx += 1; pais_entry = create_input_field(left_frame, row_idx, "País:")
    row_idx += 1
    itinerario_var = tk.StringVar(value="Ciências Naturais/Matemática")
    create_option_menu(left_frame, row_idx, "Opção de Itinerário:", itinerario_var, ["Ciências Naturais/Matemática", "Linguagens/Sociais"])
    row_idx += 1; endereco_entry = create_input_field(left_frame, row_idx, "Endereço:")
    row_idx += 1; numero_entry = create_input_field(left_frame, row_idx, "Número:")
    row_idx += 1; bairro_entry = create_input_field(left_frame, row_idx, "Bairro:")
    row_idx += 1
    zona_var = tk.StringVar(value="Urbana")
    create_radio_buttons(left_frame, row_idx, "Zona Urbana/Rural:", zona_var, ["Urbana", "Rural"])
    row_idx += 1; cep_entry = create_input_field(left_frame, row_idx, "CEP:")
    row_idx += 1; cidade_entry = create_input_field(left_frame, row_idx, "Cidade:")
    row_idx += 1; uf_cidade_entry = create_input_field(left_frame, row_idx, "UF da Cidade:")
    row_idx += 1; telefone_celular_entry = create_input_field(left_frame, row_idx, "Telefone Celular:")
    row_idx += 1; telefone_recado_entry = create_input_field(left_frame, row_idx, "Telefone Recado:")
    row_idx += 1; email_entry = create_input_field(left_frame, row_idx, "Email:")
    row_idx += 1; profissao_entry = create_input_field(left_frame, row_idx, "Profissão:")
    row_idx += 1; local_trabalho_entry = create_input_field(left_frame, row_idx, "Local de Trabalho:")
    row_idx += 1
    nivel_var = tk.StringVar(value="Ensino Fundamental")
    create_option_menu(left_frame, row_idx, "Requer Matrícula no:", nivel_var, ["Ensino Fundamental", "Ensino Médio"])
    row_idx += 1
    serie_var = tk.StringVar(value="1º Termo")
    create_option_menu(left_frame, row_idx, "Termo/Série:", serie_var, ["1º Termo", "2º Termo", "3º Termo", "4º Termo", "1ª Série", "2ª Série", "3ª Série"])
    row_idx += 1
    ensino_religioso_var = tk.StringVar(value="Sim")
    create_radio_buttons(left_frame, row_idx, "Ensino Religioso:", ensino_religioso_var, ["Sim", "Não"])
    row_idx += 1
    estudou_ue_var = tk.StringVar(value="Sim")
    create_radio_buttons(left_frame, row_idx, "Estudou nesta U.E.:", estudou_ue_var, ["Sim", "Não"])
    row_idx += 1
    aproveitamento_var = tk.StringVar(value="Sim")
    create_radio_buttons(left_frame, row_idx, "Aproveitamento de Estudos:", aproveitamento_var, ["Sim", "Não"])
    row_idx += 1
    necessidades_var = tk.StringVar(value="Não")
    create_radio_buttons(left_frame, row_idx, "Portador de necessidades ou PCD:", necessidades_var, ["Sim", "Não"])
    row_idx += 1; necessidade_qual_entry = create_input_field(left_frame, row_idx, "Se sim, qual:")

    row_idx_doc = 0
    tk.Label(right_frame, text="Documentos Entregues:", font=("Arial", 10, "bold")).grid(row=row_idx_doc, column=0, columnspan=2, sticky='w', pady=(0,5))
    row_idx_doc += 1; doc_rg_var = create_checkbox_field(right_frame, row_idx_doc, "RG:")
    row_idx_doc += 1; doc_cpf_var = create_checkbox_field(right_frame, row_idx_doc, "CPF:")
    row_idx_doc += 1; doc_foto_var = create_checkbox_field(right_frame, row_idx_doc, "Foto:")
    row_idx_doc += 1; doc_requerimento_var = create_checkbox_field(right_frame, row_idx_doc, "Req. Disp. Ed. Física:")
    row_idx_doc += 1; doc_historico_var = create_checkbox_field(right_frame, row_idx_doc, "Histórico Escolar EF:")
    row_idx_doc += 1; doc_comprovante_var = create_checkbox_field(right_frame, row_idx_doc, "Histórico Escolar EM:")
    row_idx_doc += 1; doc_vacinacao_var = create_checkbox_field(right_frame, row_idx_doc, "Comprovante de Residência:")
    row_idx_doc += 1; doc_certidao_var = create_checkbox_field(right_frame, row_idx_doc, "Outros:")
    row_idx_doc += 1; doc_aproveitamento_var = create_checkbox_field(right_frame, row_idx_doc, "Cert. Nasc/Casamento:")
    row_idx_doc += 1; doc_relatorio_var = create_checkbox_field(right_frame, row_idx_doc, "Reservista:")
    row_idx_doc += 1; doc_transferencia_var = create_checkbox_field(right_frame, row_idx_doc, "Título de Eleitor:")
    row_idx_doc += 1; doc_req_transferencia_var = create_checkbox_field(right_frame, row_idx_doc, "Carteira de Vacinação:")
    row_idx_doc += 1; doc_decl_matricula_var = create_checkbox_field(right_frame, row_idx_doc, "Atestado de Elim. de Disciplina:")
    row_idx_doc += 1; doc_boletim_var = create_checkbox_field(right_frame, row_idx_doc, "Declaração de Transferência:")
    row_idx_doc += 1; doc_certificado_var = create_checkbox_field(right_frame, row_idx_doc, "Certificado de Conclusão (Data Matr.):")

    tk.Button(form_window, text="Preencher Ficha e Abrir", command=lambda: enviar(form_window)).pack(pady=20)

    form_window.mainloop()

if __name__ == "__main__":
    main_window()