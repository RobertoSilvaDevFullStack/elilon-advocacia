---
name: git-archaeology
description: Non-destructive historical investigation, regression hunting, blame analysis, git log forensics, and code churn analysis. Use when diagnosing when or why a bug was introduced, tracking historical decisions, and correlating commits with regressions.
---

# Git Archaeology & Forensic Investigation

## Overview
Esta Skill orienta a investigação histórica não-destrutiva no repositório Git. Ela fornece metodologias forenses para identificar a gênese de bugs, rastrear o contexto de decisões arquiteturais antigas, mapear arquivos com alta rotatividade (*churn*) e correlacionar alterações passadas com comportamentos inesperados no presente.

---

## 1. Princípio Fundamental: Investigação Estritamente Read-Only

> 🛡️ **REGRA DE OURO:** Todo trabalho arqueológico é investigativo e observacional.
> **NUNCA** execute comandos que alterem ou destruam o histórico do repositório durante a análise forense (`git reset --hard`, `git push --force`, `git clean -f`, rebases interativos ou alterações forçadas de árvore).

---

## 2. Técnicas de Busca Forense (Git Forensic Commands)

### A. Rastreamento por Símbolo / String (Pickaxe Search)
Quando você precisa descobrir em qual commit exato uma constante, função, URL ou string foi adicionada ou removida:
```powershell
# Localiza commits que alteraram o número de ocorrências de uma string exata
git log -S "WHATSAPP_PHONE" --oneline

# Localiza commits e exibe o patch completo da modificação
git log -S "isN8NConfigured" -p

# Busca baseada em expressão regular
git log -G "from.*\[#C41414\]" --oneline -p
```

### B. Arqueologia de Linha e Bloco (Line-Level Blame)
Para entender quem alterou determinada linha e em qual contexto sem ser enganado por meras reformatações de espaçamento:
```powershell
# Blame ignorando alterações de whitespace e quebras de linha
git blame -w path/to/file.tsx

# Blame rastreando código movido ou copiado dentro do mesmo commit
git blame -w -M -C path/to/file.tsx

# Blame restrito a um intervalo de linhas relevante
git blame -L 70,90 components/Navbar.tsx
```

### C. Evolução Histórica de uma Função ou Arquivo
Para visualizar todos os patches que tocaram um arquivo ou trecho específico ao longo do tempo:
```powershell
# Histórico de alterações com patch de um arquivo específico
git log -p -n 5 src/config/n8n.ts

# Topologia da árvore com nomes de branches e tags
git log --graph --oneline --decorate -20
```

---

## 3. Metodologia de Caça a Regressões (Regression Hunting)

Quando uma funcionalidade parou de funcionar e você precisa identificar o commit que causou a quebra:

1. **Identificar o Último Commit Bom Conhecido (*Good*) e o Commit Ruim Atual (*Bad*):**
   - Inspecione tags de release ou commits anteriores nos quais os testes automatizados ou o build passavam.
2. **Intervalo de Investigação:**
   ```powershell
   git log --oneline <commit-bom>..<commit-ruim>
   ```
3. **Busca Binária Não-Destrutiva:**
   - Em vez de reescrever o histórico, utilize `git checkout <commit-intermediario>` para rodar os testes unitários (`npm test`) e determinar se o bug já estava presente naquele ponto da linha do tempo.
   - Uma vez localizado o commit faltoso, use `git show <commit-hash>` para examinar o patch completo e entender os efeitos colaterais introduzidos.

---

## 4. Análise de Churn e Mapeamento de Hotspots

Arquivos que mudam com frequência desproporcional e acumulam muitos autores tendem a concentrar a maior taxa de defeitos e acoplamento arquitetural:

1. **Listar Arquivos com Maior Frequência de Modificação (Hotspots):**
   ```powershell
   git log --format=format: --name-only --since="6 months ago" | Where-Object { $_ -ne "" } | Group-Object | Sort-Object Count -Descending | Select-Object -First 15
   ```
2. **Interpretação:**
   - Se um componente de UI (ex.: `Navbar.tsx`) ou utilitário (ex.: `whatsapp.ts`) aparece no topo do churn, avalie a necessidade de extrair configurações hardcoded para constantes centralizadas ou arquivos de configuração tipados.
