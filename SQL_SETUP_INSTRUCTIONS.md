# 🗄️ Configuração do Banco de Dados (SQL)

Para que a aplicação funcione corretamente, você precisa criar as tabelas no Supabase.

## Passo a Passo:

### 1. Abra o Supabase
- Acesse: https://supabase.com
- Faça login na sua conta
- Selecione seu projeto

### 2. Vá para SQL Editor
- No menu à esquerda, clique em **"SQL Editor"**
- Clique em **"+ New Query"**

### 3. Copie o SQL
- Abra o arquivo `DATABASE_SETUP.sql` na raiz do projeto
- Copie TODO o conteúdo (Ctrl+A e Ctrl+C)

### 4. Cole e Execute
- Cole o SQL no Supabase (Ctrl+V)
- Clique em **"Run"** (ou Cmd+Enter no Mac)
- Você verá mensagens de sucesso para cada operação

### 5. Pronto! ✅
Agora as tabelas estão criadas:
- `menu_items` - Itens do menu (já com as 5 marcas pré-preenchidas)
- `hero_config` - Configuração do hero
- `product_highlights` - Produtos em destaque
- `products.is_on_request` - Novo campo adicionado

---

## O que foi criado no SQL:

✅ **menu_items** - Menu dinâmico editável
   - Início, Produtos, Apple, Samsung, Xiaomi, LG, Motorola

✅ **hero_config** - Configuração do hero
   - Nome, imagem, título do carrossel

✅ **product_highlights** - Destaques para o carrossel
   - Produtos aparecem no carrossel do hero

✅ **products.is_on_request** - Marcar produtos como "Por Pedido"

---

## Após rodar o SQL:

1. Acesse o **Painel Admin** (http://localhost:8080/admin)
2. Você verá novas abas:
   - **Menu** - Editar itens do menu
   - **Hero** - Configurar logo/imagem e título
   - **Destaques** - Marcar produtos para o carrossel

3. Configure:
   - Imagem do hero
   - Título do carrossel
   - Selecione produtos para aparecer no carrossel

---

## Dúvidas?

Se os produtos não aparecerem mesmo após rodar o SQL:
1. Verifique se você já tem produtos cadastrados
2. Vá para **Painel Admin** → **Destaques**
3. Selecione um produto para ser destaque
4. O produto aparecerá no carrossel do hero em segundos!
