# Travel Front - Front-end (SPA)

Esta é a aplicação Single Page Application (SPA) para gestão de viagens. Construída com foco rigoroso em Clean Code, Type Safety e Developer Experience (DX).

O projeto foi desenhado para consumir a API RESTful do backend, isolando completamente as regras de apresentação das regras de negócio, garantindo uma arquitetura escalável e altamente testável.

## Quick Start

A arquitetura de infraestrutura local foi projetada para minimizar o atrito. Não é necessário instalar versões específicas do Node.js na sua máquina host; o ambiente é 100% conteinerizado.

Execute o comando de inicialização na raiz do projeto:

    make start

O que o comando setup realiza em background:
1. Verifica a existência do arquivo .env; realiza a cópia a partir do .env.example caso não exista.
2. Executa o build da imagem Docker utilizando Multi-stage build (Node.js para compilação estrita + Nginx para servir arquivos estáticos).
3. Encerra containers órfãos antigos e sobe a aplicação em estado limpo na porta 3000.
4. A aplicação estará disponível em: http://localhost:3000

---

## Stack Tecnológica

* Framework: Vue 3 (Composition API) + Vite
* Linguagem: TypeScript (Strict Mode)
* Estilização: TailwindCSS (Utility-first responsivo e padronizado)
* Comunicação HTTP: Axios (com interceptors configurados)
* Quality Assurance: Cypress para testes End-to-End (E2E)
* Infraestrutura e DX: Docker, Nginx-Alpine, Makefile

---

## Arquitetura e Decisões de Engenharia (Trade-offs)

### 1. Separação de Responsabilidades (Service Pattern)
Em vez de acoplar chamadas HTTP (Axios) diretamente aos componentes Vue, implementamos uma camada de abstração em src/services (ex: TravelOrderService.ts). 
* Isso isola o contrato da API. Se a estrutura do Backend sofrer mutações, alteramos apenas os DTOs de Entrada/Saída na camada de Service, preservando a integridade dos componentes visuais e facilitando a manutenção.

### 2. Integração com API Externa (IBGE) e Componentização
O Autocomplete de cidades (CityAutocomplete.vue) consome a API oficial do IBGE. 
* Trade-off: Fazer cache local vs. buscar em tempo real. Optamos por buscar e manter a lista em memória (utilizando o Composable genérico useCities) durante a sessão do componente. Isso evita gargalos de rede, previne falsos-negativos nas interações de tela e permite aplicar travas de integridade (Strict Mode) no evento de blur, impedindo que strings arbitrárias cheguem ao backend.

### 3. Docker Multi-Stage Build
O Dockerfile foi construído com foco em segurança de artefato e redução de tamanho da imagem.
* Stage 1 (Build): Utiliza a imagem do Node.js baseada em Alpine, roda npm ci para garantir o determinismo das dependências e executa o compilador agressivo do vue-tsc. Se houver erro de tipagem no código, a pipeline falha e a imagem não é gerada (Fail-fast).
* Stage 2 (Produção): Descarta o Node e utiliza um nginx:alpine puro (reduzindo drasticamente a superfície de ataque e o tamanho em megabytes). Configurado com fallback de try_files para o index.html, roteando perfeitamente os caminhos virtuais do Vue Router sem gerar erros 404 Not Found em reloads.

---

## Estratégia de Qualidade e Testes (E2E)

O projeto conta com uma suíte de testes ponta-a-ponta utilizando Cypress. A filosofia de automação baseia-se em validar o comportamento empírico da Interface do Usuário, ignorando a implementação interna.

Para rodar os testes localmente em modo interativo:

    make test-ui

### Diretrizes da Engenharia de Testes:
1. Network Stubbing Determinístico: Utilizamos cy.intercept exaustivamente para simular (stub) as respostas do Backend e da camada de autenticação. O front-end é testado em total isolamento, prevenindo falsos positivos causados por latência de rede ou indisponibilidade do servidor.
2. Seletores Semânticos (A11y): A navegação pelo DOM evita o acoplamento a classes CSS frágeis. O Cypress utiliza identificadores únicos (#id) estritamente vinculados às tags label. Isso garante resiliência aos testes e força a aplicação de boas práticas de Acessibilidade.
3. Controle de Latência Assíncrona: Testes que interagem com a API externa (IBGE) possuem esperas explícitas na camada de rede (cy.wait), mitigando Race Conditions causadas pelo assincronismo do framework.
4. Validação de Controle de Acesso (RBAC): Os fluxos garantem que componentes administrativos (ex: filtros por solicitante, botões de aprovação/rejeição) não sejam renderizados no DOM para contas com nível de acesso padrão.

---

## Comandos Disponíveis (Makefile)

O Makefile orquestra todas as tarefas de infraestrutura e desenvolvimento.

| Comando       | Descrição |
| make start    | Executa o setup do .env, compila a imagem Docker e sobe o container Nginx na porta 3000. |
| make install  | Executa npm ci para uma instalação rigorosa baseada no package-lock.json. |
| make dev      | Inicia o servidor local do Vite em ambiente de desenvolvimento. |
| make build    | Compila o TypeScript e gera o bundle estático otimizado na pasta /dist. |
| make test     | Executa a suíte E2E do Cypress em modo headless (ideal para pipelines CI/CD). |
| make test-ui  | Abre a interface gráfica interativa do Cypress. |
| make clean    | Encerra os containers do projeto, remove a imagem local e deleta os diretórios /node_modules e /dist. |