// ARQUIVO: test_checklist_integration.js
// Script de teste para verificar a integração do checklist de documentos

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Configuração - substitua com seus valores reais
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'your-service-role-key';
const STUDENT_ID = 'your-test-student-id';
const ADMIN_TOKEN = 'your-admin-jwt-token';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('🧪 Iniciando testes de integração do Checklist de Documentos...\n');

// Teste 1: Verificar se as tabelas foram criadas
async function testDatabaseTables() {
    console.log('📋 Teste 1: Verificando tabelas do banco de dados...');

    try {
        // Verificar tabela principal
        const { data: checklistTable, error: checklistError } = await supabase
            .from('student_document_checklist')
            .select('id')
            .limit(1);

        if (checklistError) throw checklistError;

        // Verificar tabela de templates
        const { data: templatesTable, error: templatesError } = await supabase
            .from('document_templates')
            .select('id')
            .limit(1);

        if (templatesError) throw templatesError;

        // Verificar tabela de histórico
        const { data: historyTable, error: historyError } = await supabase
            .from('student_document_checklist_history')
            .select('id')
            .limit(1);

        if (historyError) throw historyError;

        console.log('✅ Todas as tabelas foram criadas com sucesso!');
        return true;

    } catch (error) {
        console.error('❌ Erro ao verificar tabelas:', error.message);
        return false;
    }
}

// Teste 2: Verificar se os templates de documentos foram inseridos
async function testDocumentTemplates() {
    console.log('\n📋 Teste 2: Verificando templates de documentos...');

    try {
        const { data: templates, error } = await supabase
            .from('document_templates')
            .select('*')
            .eq('is_active', true);

        if (error) throw error;

        const requiredDocs = templates.filter(t => t.is_required);
        const optionalDocs = templates.filter(t => !t.is_required);

        console.log(`✅ Encontrados ${templates.length} templates ativos`);
        console.log(`   - ${requiredDocs.length} documentos obrigatórios`);
        console.log(`   - ${optionalDocs.length} documentos opcionais`);

        // Verificar documentos essenciais
        const essentialDocs = ['rg', 'cpf', 'historico_escolar_fundamental'];
        const missingEssential = essentialDocs.filter(doc =>
            !templates.some(t => t.document_type === doc)
        );

        if (missingEssential.length > 0) {
            console.log(`⚠️  Documentos essenciais não encontrados: ${missingEssential.join(', ')}`);
        } else {
            console.log('✅ Todos os documentos essenciais estão presentes');
        }

        return true;

    } catch (error) {
        console.error('❌ Erro ao verificar templates:', error.message);
        return false;
    }
}

// Teste 3: Testar criação de checklist via API
async function testCreateChecklist() {
    console.log('\n📋 Teste 3: Testando criação de checklist...');

    const url = `${SUPABASE_URL.replace('/rest/v1', '')}/functions/v1/document-checklist-crud?student_id=${STUDENT_ID}`;

    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve) => {
        const req = https.request(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);

                    if (res.statusCode === 201) {
                        console.log('✅ Checklist criado com sucesso!');
                        console.log(`   ID: ${response.id}`);
                        console.log(`   Documentos: ${response.items.length}`);
                        resolve(true);
                    } else if (res.statusCode === 409) {
                        console.log('ℹ️  Checklist já existe para este estudante');
                        resolve(true);
                    } else {
                        console.error('❌ Erro ao criar checklist:', response.error);
                        resolve(false);
                    }
                } catch (error) {
                    console.error('❌ Erro ao processar resposta:', error.message);
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Erro na requisição:', error.message);
            resolve(false);
        });

        req.setTimeout(10000, () => {
            console.error('❌ Timeout na requisição');
            req.destroy();
            resolve(false);
        });

        req.end();
    });
}

// Teste 4: Testar busca de checklist
async function testGetChecklist() {
    console.log('\n📋 Teste 4: Testando busca de checklist...');

    const url = `${SUPABASE_URL.replace('/rest/v1', '')}/functions/v1/document-checklist-crud?student_id=${STUDENT_ID}`;

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve) => {
        const req = https.request(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);

                    if (res.statusCode === 200) {
                        console.log('✅ Checklist encontrado com sucesso!');
                        console.log(`   Status: ${response.status.is_complete ? 'Completo' : 'Incompleto'}`);
                        console.log(`   Documentos obrigatórios: ${response.status.total_required}`);
                        console.log(`   Documentos entregues: ${response.status.total_delivered}`);
                        console.log(`   Documentos aprovados: ${response.status.total_approved}`);
                        resolve(true);
                    } else {
                        console.error('❌ Erro ao buscar checklist:', response.error);
                        resolve(false);
                    }
                } catch (error) {
                    console.error('❌ Erro ao processar resposta:', error.message);
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Erro na requisição:', error.message);
            resolve(false);
        });

        req.setTimeout(10000, () => {
            console.error('❌ Timeout na requisição');
            req.destroy();
            resolve(false);
        });

        req.end();
    });
}

// Teste 5: Testar atualização de documento
async function testUpdateDocument() {
    console.log('\n📋 Teste 5: Testando atualização de documento...');

    const url = `${SUPABASE_URL.replace('/rest/v1', '')}/functions/v1/document-checklist-crud?student_id=${STUDENT_ID}`;

    const updateData = {
        document_type: 'rg',
        is_delivered: true,
        approved_by_admin: false,
        admin_notes: 'Teste de integração - RG marcado como entregue'
    };

    const options = {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve) => {
        const req = https.request(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);

                    if (res.statusCode === 200) {
                        console.log('✅ Documento atualizado com sucesso!');
                        console.log(`   Documento: ${updateData.document_type}`);
                        console.log(`   Status: ${updateData.is_delivered ? 'Entregue' : 'Pendente'}`);
                        resolve(true);
                    } else {
                        console.error('❌ Erro ao atualizar documento:', response.error);
                        resolve(false);
                    }
                } catch (error) {
                    console.error('❌ Erro ao processar resposta:', error.message);
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Erro na requisição:', error.message);
            resolve(false);
        });

        req.setTimeout(10000, () => {
            console.error('❌ Timeout na requisição');
            req.destroy();
            resolve(false);
        });

        req.write(JSON.stringify(updateData));
        req.end();
    });
}

// Executar todos os testes
async function runAllTests() {
    console.log('🚀 Iniciando suite completa de testes...\n');

    const results = {
        databaseTables: false,
        documentTemplates: false,
        createChecklist: false,
        getChecklist: false,
        updateDocument: false
    };

    // Executar testes sequencialmente
    results.databaseTables = await testDatabaseTables();
    results.documentTemplates = await testDocumentTemplates();
    results.createChecklist = await testCreateChecklist();
    results.getChecklist = await testGetChecklist();
    results.updateDocument = await testUpdateDocument();

    // Resultado final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESULTADO FINAL DOS TESTES');
    console.log('='.repeat(50));

    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r).length;

    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅' : '❌';
        const name = test.replace(/([A-Z])/g, ' $1').toLowerCase();
        console.log(`${status} ${name}`);
    });

    console.log('');
    console.log(`📈 ${passedTests}/${totalTests} testes passaram`);

    if (passedTests === totalTests) {
        console.log('🎉 Todos os testes passaram! A integração está funcionando perfeitamente.');
    } else {
        console.log('⚠️  Alguns testes falharam. Verifique a configuração e logs.');
    }

    console.log('='.repeat(50));

    // Instruções para próximos passos
    console.log('\n📝 PRÓXIMOS PASSOS:');
    console.log('1. ✅ Execute a migration SQL no seu banco Supabase');
    console.log('2. ✅ Configure as variáveis de ambiente');
    console.log('3. ✅ Teste a interface no navegador');
    console.log('4. 🔄 Monitore os logs do Supabase para erros');
    console.log('5. 🔄 Ajuste as configurações conforme necessário');

    process.exit(passedTests === totalTests ? 0 : 1);
}

// Verificar se tem configuração mínima
if (!SUPABASE_URL.includes('your-project')) {
    console.log('⚠️  Configure as variáveis no início do arquivo antes de executar os testes.');
    process.exit(1);
}

// Executar testes
runAllTests().catch(console.error);