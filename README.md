# Montandon - Automação de Prospecção e WhatsApp

Sistema simplificado para busca de leads no Google Maps e disparos de WhatsApp via Evolution API.

## Pré-requisitos (Windows)

1.  **Docker Desktop**: Precisa estar instalado e rodando. [Baixar aqui](https://www.docker.com/products/docker-desktop/).
2.  **Git**: Para baixar e atualizar o sistema. [Baixar aqui](https://git-scm.com/download/win).
3.  **Evolution API**: Você já deve ter o Evolution API rodando em sua máquina (usaremos a porta padrão 8080 ou a que você configurou).

## Instalação Rápida

1.  Baixe este repositório em uma pasta do seu computador.
    ```powershell
    git clone https://github.com/adialaleal/montandon.git
    cd montandon
    ```
2.  Dê um clique duplo no arquivo **`iniciar.bat`**.
3.  Na primeira execução, ele vai criar um arquivo chamado `.env` e pedir para você configurar.
    *   Abra o arquivo `.env` com o Bloco de Notas.
    *   Coloque sua `APIFY_API_KEY` (para buscar empresas).
    *   Coloque a `EVOLUTION_API_KEY` (sua chave global do Evolution).
    *   Verifique se `EVOLUTION_API_URL` está correta (padrão: `http://host.docker.internal:8080` para conectar no Evolution rodando no Windows fora desse Docker).
4.  Salve o arquivo e rode o **`iniciar.bat`** novamente.

Acesse o sistema em: **http://localhost:3000**

## Como Atualizar

Sempre que houver novidades, basta dar um clique duplo no arquivo:

*   **`atualizar.bat`**

Ele vai baixar as mudanças e reiniciar o sistema automaticamente.

## Solução de Problemas Comuns

*   **Docker não está rodando**: Certifique-se de que o ícone da baleia do Docker está perto do relógio do Windows.
*   **Erro de conexão Evolution**: Se o sistema não conecta no WhatsApp, verifique se o Evolution API está ligado e se a URL no `.env` está certa. O endereço `host.docker.internal` serve para o container acessar o Windows ("localhost" do Windows).
