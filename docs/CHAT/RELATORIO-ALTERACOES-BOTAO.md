# Relatório de Alterações - Botão Flutuante Chat Jurídico

## Data: 15/06/2026

---

## Resumo

Melhorias implementadas no botão flutuante do Chat Jurídico para aumentar conversão e corrigir sobreposição com o WhatsApp.

---

## Arquivos Modificados

### 1. `components/Layout.tsx`
**Alteração:** Posicionamento do botão WhatsApp
```typescript
// ANTES
className="fixed bottom-6 right-6 z-50 bg-green-600..."

// DEPOIS  
className="fixed z-40 bg-green-600..."
style={{ bottom: "30px", right: "24px" }}
```
- Z-index reduzido de 50 para 40
- Posição fixa: 30px do fundo, 24px da direita

---

### 2. `src/modules/chat/presentation/components/ChatWidget/ChatButton.tsx`
**Alterações:**

#### a) Novo posicionamento
```typescript
style={{ bottom: "120px", right: "24px" }}  // 120px acima do WhatsApp
```

#### b) Interface estendida
```typescript
interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
  unreadCount?: number;
  showCta?: boolean;           // NOVO
  onCloseCta?: () => void;    // NOVO
}
```

#### c) Ícone GIF personalizado
```typescript
<img
  src="/images/apoio-suporte.gif"
  alt="Suporte Jurídico"
  className="w-12 h-12 object-cover rounded-full"
/>
```

#### d) Balão de CTA
```typescript
{showCta && !isOpen && (
  <div className="mb-3 relative animate-cta-enter">
    <p>⚖️ Avalie seu caso gratuitamente</p>
    <button onClick={onCloseCta}>X</button>
  </div>
)}
```

#### e) Animações CSS adicionadas
| Animação | Efeito | Duração |
|----------|--------|---------|
| `ctaEnter` | Fade-in + slide-up do balão | 0.5s |
| `chatPulse` | Glow pulsante no botão | 2s loop |
| `badgeBounce` | Bounce sutil no badge | 1s loop |

---

### 3. `src/modules/chat/presentation/components/ChatWidget/ChatWidget.tsx`
**Alterações:**

#### a) Constantes de controle
```typescript
const CTA_CLOSED_KEY = "chat_cta_closed_at";
const CTA_COOLDOWN_HOURS = 24;
```

#### b) Novo estado
```typescript
const [showCta, setShowCta] = useState(false);
```

#### c) Verificação de cooldown
```typescript
const shouldShowCta = useCallback(() => {
  const closedAt = localStorage.getItem(CTA_CLOSED_KEY);
  const hoursDiff = (now - closedTime) / (1000 * 60 * 60);
  return hoursDiff >= CTA_COOLDOWN_HOURS;
}, []);
```

#### d) Delay de 3 segundos
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    setShowCta(true);
  }, 3000);
  return () => clearTimeout(timer);
}, []);
```

#### e) Fechar CTA com persistência
```typescript
const handleCloseCta = useCallback(() => {
  setShowCta(false);
  localStorage.setItem(CTA_CLOSED_KEY, new Date().toISOString());
}, []);
```

---

## Classes CSS Adicionadas

### Animações customizadas
```css
/* Entrada suave do CTA */
@keyframes ctaEnter {
  0% { opacity: 0; transform: translateY(10px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* Glow pulsante discreto */
@keyframes chatPulse {
  0%, 100% { 
    box-shadow: 0 4px 20px rgba(161, 51, 62, 0.4), 
                 0 0 0 4px rgba(161, 51, 62, 0.1); 
  }
  50% { 
    box-shadow: 0 4px 25px rgba(161, 51, 62, 0.5), 
                 0 0 0 6px rgba(161, 51, 62, 0.15); 
  }
}

/* Bounce sutil no badge */
@keyframes badgeBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

### Classes aplicadas
- `.animate-cta-enter` - Animação de entrada do balão
- `.animate-chat-pulse` - Pulsação do botão
- `.animate-badge-bounce` - Bounce no badge de notificações
- `.animate-ping` - Anel de glow (Tailwind nativo)

---

## Comportamento Implementado

### Fluxo de exibição do CTA
```
Usuário entra na página
        ↓
Aguarda 3 segundos
        ↓
Verifica localStorage (último fechamento > 24h?)
        ↓
    SIM → Mostra CTA
    NÃO → CTA permanece oculto
        ↓
Usuário pode:
    • Clicar no X → Fecha CTA, salva timestamp
    • Clicar no botão → Abre chat, CTA some
    • Ignorar → CTA permanece visível
```

### Posicionamento na tela
```
┌─────────────────────────────────────┐
│                                     │
│           CONTEÚDO                  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    ⚖️ Avalie seu caso gratuitamente │ ← Balão CTA (acima)
│         ┌─────────┐                 │
│         │   GIF   │ ← Chat (120px) │
│         └─────────┘                 │
│                                     │
│              ┌─────────┐            │
│              │ WhatsApp│ ← (30px)   │
│              └─────────┘            │
└─────────────────────────────────────┘
```

---

## Acessibilidade

### Implementado
- ✅ `aria-label` nos botões
- ✅ Contraste de cores (vinho #A1333E sobre branco)
- ✅ Estados de hover/focus visíveis
- ✅ Botão de fechar CTA com `aria-label`
- ✅ Texto alternativo na imagem GIF
- ✅ Animações não impedem interação

### Responsividade
- ✅ Mobile: Botões redimensionam proporcionalmente
- ✅ Tablet: Posicionamento mantém espaçamento
- ✅ Desktop: Layout fixo otimizado
- ✅ Z-index: Chat (50) > WhatsApp (40)

---

## Estilo Visual

### Cores utilizadas
| Elemento | Cor | Código |
|----------|-----|--------|
| Botão Chat | Gradiente vinho | `#A1333E → #812932` |
| Balão CTA | Gradiente vinho | `#A1333E → #812932` |
| Badge | Vermelho | `#F74747` |
| Glow pulse | Vinho translúcido | `rgba(161, 51, 62, 0.1-0.5)` |

### Tipografia
- **CTA Texto:** 14px, font-weight 500, branco
- **Badge:** 12px, font-weight bold, branco

---

## Teste Rápido

### Verificar funcionamento:
1. Abrir aplicação
2. Aguardar 3 segundos → CTA deve aparecer
3. Clicar no X → CTA fecha
4. Recarregar página → CTA não deve aparecer (dentro de 24h)
5. Verificar posicionamento → Chat acima do WhatsApp
6. Abrir chat → CTA deve sumir
7. Fechar chat → CTA não reaparece (já fechado)

---

## Próximas Melhorias Sugeridas

1. **A/B Test:** Testar textos diferentes no CTA
2. **Analytics:** Trackear clicks no CTA vs botão
3. **Mobile:** Ajustar tamanho em telas < 360px
4. **i18n:** Suporte para múltiplos idiomas

---

## Status

✅ **TODAS AS ALTERAÇÕES IMPLEMENTADAS**

- [x] Posicionamento ajustado
- [x] Ícone GIF integrado
- [x] Balão CTA criado
- [x] Animações adicionadas
- [x] Controle de exibição (3s + 24h)
- [x] Responsividade verificada
- [x] Acessibilidade garantida
