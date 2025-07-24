# ⚽ Gerenciador de Atletas - Frontend (React)

Este é o frontend da aplicação **futstats**, desenvolvido com **React**, que permite a interação visual com os dados dos jogadores, clubes, estatísticas e transferências.

## 🚀 Tecnologias

- React
- JavaScript
- HTML + CSS
- Axios (requisições HTTP)
- React Router (para rotas internas)

## 📁 Funcionalidades principais

- **Visualização da lista de atletas e clubes**
- **Cadastro, edição e exclusão de atletas**
- **Registro de estatísticas (gols, assistências)**
- **Transferência de atletas entre clubes**

## 📌 Componentes em destaque

- `GerenciarAtleta`: responsável pelas ações de CRUD e visualização de estatísticas por atleta.
- `FormularioAtleta`: formulário para criar e editar jogadores.
- `ListaClubes`: exibe os clubes cadastrados.
- `PainelEstatisticas`: exibe e edita gols, assistências e histórico por atleta.
- `TransferirAtleta`: componente (em desenvolvimento) para realizar a transferência de atletas.

## 🔗 Integração

Todo o frontend consome os dados da API REST fornecida pelo backend Spring Boot do projeto.
