// lib/core/utils/validators.dart

import { required, email, regex } from 'react-admin';

export const validateRequired = required('Este campo é obrigatório.');

export const validateEmail = email('Por favor, insira um e-mail válido.');

export const validateCpf = regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato de CPF inválido. Use XXX.XXX.XXX-XX.');

export const validatePhone = regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato de telefone inválido. Use (XX) XXXXX-XXXX.');

export const validateTerms = (value: any) => value ? undefined : 'Você deve aceitar os termos.';

/**
 * Função para formatação de data ISO para formato brasileiro
 * @param isoDate - Data no formato ISO (yyyy-mm-dd)
 * @returns Data no formato brasileiro (dd/mm/yyyy) ou null se inválida
 */
export const formatDateToBrazilian = (isoDate: string | null | undefined): string | null => {
    // Log de debug para entrada
    console.log('🔄 [DateFormatter] Formatando data ISO para brasileiro:', {
        input: isoDate,
        type: typeof isoDate
    });

    // Verifica se a data é válida
    if (!isoDate || typeof isoDate !== 'string') {
        console.log('⚠️ [DateFormatter] Data inválida ou nula:', isoDate);
        return null;
    }

    try {
        // Valida o formato ISO básico (yyyy-mm-dd)
        const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!isoRegex.test(isoDate)) {
            console.log('❌ [DateFormatter] Formato ISO inválido:', isoDate);
            return null;
        }

        // Cria um objeto Date para validação
        const date = new Date(isoDate + 'T00:00:00');

        // Verifica se a data é válida
        if (isNaN(date.getTime())) {
            console.log('❌ [DateFormatter] Data ISO inválida:', isoDate);
            return null;
        }

        // Extrai dia, mês e ano
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        // Formata para dd/mm/yyyy
        const brazilianDate = `${day}/${month}/${year}`;

        console.log('✅ [DateFormatter] Conversão bem-sucedida:', {
            input: isoDate,
            output: brazilianDate,
            parsedDate: date.toISOString().split('T')[0]
        });

        return brazilianDate;

    } catch (error) {
        console.error('❌ [DateFormatter] Erro ao formatar data:', error, { input: isoDate });
        return null;
    }
};