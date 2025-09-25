const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ucxjsrrggejajsxrxnov.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjeGpzcnJnZ2VqYWpzeHJ4bm92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTIzNDQ3NCwiZXhwIjoyMDY0ODEwNDc0fQ.-dA14G-VVDEw3kjvblRIKyNbLctqz4iTcLviah0cqgc'
);

async function test() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    const { data, error } = await supabase
      .from('document_templates')
      .select('count');
    
    if (error) {
      console.log('❌ Migration NÃO foi executada');
      console.log('Erro:', error.message);
    } else {
      console.log('✅ Migration executada com sucesso!');
      console.log('Document templates:', data);
    }
  } catch (err) {
    console.log('❌ Erro ao conectar:', err.message);
  }
}

test();
