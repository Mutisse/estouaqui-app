<!-- pages/ServicosPage.vue -->
<template>
  <q-page class="sp-page">

    <!-- ===== HERO ===== -->
    <section class="sp-hero">
      <div class="sp-hero__bg">
        <div class="sp-hero__orb sp-hero__orb--1"></div>
        <div class="sp-hero__orb sp-hero__orb--2"></div>
        <div class="sp-hero__grid"></div>
      </div>

      <div class="sp-hero__content sp-container">
        <div class="sp-hero__badge">
          <span class="sp-badge__dot"></span>
          30+ categorias disponíveis
        </div>

        <h1 class="sp-hero__heading">
          Encontre o serviço<br>
          <span class="sp-heading-accent">que precisa</span>
        </h1>

        <p class="sp-hero__sub">
          Profissionais qualificados em todo Moçambique, prontos para ajudar.
        </p>

        <!-- Search bar -->
        <div class="sp-search">
          <div class="sp-search__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <input
            v-model="searchQuery"
            class="sp-search__input"
            placeholder="Pesquisar serviço ou categoria..."
            type="text"
          />
          <button class="sp-search__btn" @click="() => {}">Pesquisar</button>
        </div>
      </div>

      <!-- Stats pills -->
      <div class="sp-hero__stats sp-container">
        <div v-for="(stat, i) in stats" :key="i" class="sp-stat">
          <span class="sp-stat__val">{{ stat.value }}</span>
          <span class="sp-stat__label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <!-- ===== CATEGORIAS ===== -->
    <section class="sp-section sp-categories">
      <div class="sp-container">
        <div class="sp-section-header">
          <div class="sp-section-label">Explorar</div>
          <h2 class="sp-section-title">Serviços por Categoria</h2>
          <p class="sp-section-sub">Escolha a categoria e encontre o profissional ideal</p>
        </div>

        <!-- Filtros -->
        <div class="sp-filters">
          <button
            v-for="f in filters"
            :key="f.value"
            class="sp-filter-btn"
            :class="{ 'sp-filter-btn--active': selectedFilter === f.value }"
            @click="selectedFilter = f.value"
          >
            {{ f.label }}
          </button>
        </div>

        <!-- Grid -->
        <div class="sp-cat-grid">
          <div
            v-for="(cat, i) in filteredCategorias"
            :key="cat.id"
            class="sp-cat-card"
            :style="`animation-delay: ${i * 0.04}s`"
            @click="verCategoria(cat)"
          >
            <div class="sp-cat-card__img" :style="`background-image: url(${cat.image})`">
              <div class="sp-cat-card__img-overlay"></div>
              <div class="sp-cat-card__icon-wrap" :style="`background: ${cat.hex}`">
                <span>{{ cat.emoji }}</span>
              </div>
              <div class="sp-cat-card__rating">
                ⭐ {{ cat.rating }}
              </div>
            </div>
            <div class="sp-cat-card__body">
              <div class="sp-cat-card__name">{{ cat.nome }}</div>
              <div class="sp-cat-card__desc">{{ cat.descricao }}</div>
              <div class="sp-cat-card__footer">
                <div class="sp-cat-card__meta">
                  <span>👤 {{ cat.prestadores }} prestadores</span>
                  <span>🗂 {{ cat.servicos }} serviços</span>
                </div>
                <div class="sp-cat-card__arrow">→</div>
              </div>
            </div>
          </div>
        </div>

        <div class="sp-load-more" v-if="filteredCategorias.length >= 8">
          <button class="sp-btn-outline">Ver todas as categorias</button>
        </div>
      </div>
    </section>

    <!-- ===== DESTAQUES ===== -->
    <section class="sp-section sp-featured">
      <div class="sp-container">
        <div class="sp-section-header sp-section-header--row">
          <div>
            <div class="sp-section-label">Em Destaque</div>
            <h2 class="sp-section-title">Serviços Mais Procurados</h2>
          </div>
          <button class="sp-link-btn">Ver todos →</button>
        </div>

        <div class="sp-featured-grid">
          <div
            v-for="s in featuredServices"
            :key="s.id"
            class="sp-featured-card"
          >
            <div class="sp-featured-card__img-wrap">
              <q-img :src="s.imagem" :ratio="16/9" class="sp-featured-card__img" />
              <div class="sp-featured-card__badge" :class="s.disponivel ? 'sp-badge--green' : 'sp-badge--gray'">
                {{ s.disponivel ? 'Disponível' : 'Indisponível' }}
              </div>
            </div>
            <div class="sp-featured-card__body">
              <div class="sp-featured-card__meta">
                <div class="sp-featured-card__provider">
                  <q-avatar size="28px"><img :src="s.providerAvatar" /></q-avatar>
                  <span>{{ s.providerName }}</span>
                </div>
                <div class="sp-featured-card__rating">⭐ {{ s.rating }}</div>
              </div>
              <div class="sp-featured-card__title">{{ s.titulo }}</div>
              <div class="sp-featured-card__desc">{{ s.descricao }}</div>
              <div class="sp-featured-card__footer">
                <div>
                  <div class="sp-featured-card__price-label">A partir de</div>
                  <div class="sp-featured-card__price">{{ s.preco }} MZN</div>
                </div>
                <button class="sp-btn-solid">Contratar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== FAQ ===== -->
    <section class="sp-section sp-faq">
      <div class="sp-container">
        <div class="sp-section-header">
          <div class="sp-section-label">Dúvidas</div>
          <h2 class="sp-section-title">Perguntas Frequentes</h2>
        </div>

        <div class="sp-faq-list">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="sp-faq-item"
            :class="{ 'sp-faq-item--open': openFaq === i }"
            @click="openFaq = openFaq === i ? -1 : i"
          >
            <div class="sp-faq-item__q">
              <span>{{ faq.pergunta }}</span>
              <span class="sp-faq-item__chevron">{{ openFaq === i ? '−' : '+' }}</span>
            </div>
            <div class="sp-faq-item__a" v-show="openFaq === i">
              {{ faq.resposta }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== CTA PRESTADOR ===== -->
    <section class="sp-cta-section">
      <div class="sp-cta-section__bg">
        <div class="sp-cta__orb sp-cta__orb--1"></div>
        <div class="sp-cta__orb sp-cta__orb--2"></div>
      </div>
      <div class="sp-container sp-cta__inner">
        <div class="sp-cta__left">
          <div class="sp-cta__label">Para prestadores</div>
          <h2 class="sp-cta__title">É prestador<br>de serviços?</h2>
          <p class="sp-cta__sub">Cadastre-se agora e comece a receber clientes na sua região.</p>
        </div>
        <div class="sp-cta__right">
          <router-link to="/auth/register-prestador" class="sp-cta-white">
            Quero oferecer serviços
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </router-link>
          <router-link to="/auth/login" class="sp-cta-ghost">
            Já tenho conta
          </router-link>
        </div>
      </div>
    </section>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

interface Categoria {
  id: number
  nome: string
  emoji: string
  hex: string
  rating: number
  prestadores: number
  servicos: number
  image: string
  descricao: string
  popular: boolean
}

interface FeaturedService {
  id: number
  titulo: string
  descricao: string
  preco: string
  rating: number
  providerName: string
  providerAvatar: string
  imagem: string
  disponivel: boolean
}

interface FAQ {
  pergunta: string
  resposta: string
}

const router = useRouter()
const searchQuery = ref('')
const selectedFilter = ref('all')
const openFaq = ref(-1)

const stats = [
  { value: '1.2k+', label: 'Prestadores activos' },
  { value: '30+',   label: 'Categorias' },
  { value: '5k+',   label: 'Serviços realizados' },
  { value: '4.8★',  label: 'Avaliação média' },
]

const filters = [
  { label: 'Todos',           value: 'all' },
  { label: 'Mais Populares',  value: 'popular' },
  { label: 'Próximo de Si',   value: 'near' },
]

const categorias = ref<Categoria[]>([
  { id:1, nome:'Eletricista',   emoji:'⚡', hex:'#F59E0B', rating:4.8, prestadores:45,  servicos:128, popular:true,  descricao:'Instalações, reparações e manutenção elétrica',       image:'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80' },
  { id:2, nome:'Canalizador',  emoji:'💧', hex:'#3B82F6', rating:4.7, prestadores:32,  servicos:96,  popular:true,  descricao:'Reparação de canalizações e instalação de água',        image:'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80' },
  { id:3, nome:'Pintor',       emoji:'🎨', hex:'#8B5CF6', rating:4.6, prestadores:28,  servicos:84,  popular:false, descricao:'Pintura de interiores e exteriores',                   image:'https://images.unsplash.com/photo-1562259929-b4ec1b3b5f4a?auto=format&fit=crop&w=800&q=80' },
  { id:4, nome:'Informático',  emoji:'💻', hex:'#10B981', rating:4.9, prestadores:56,  servicos:210, popular:true,  descricao:'Reparação de computadores e assistência técnica',       image:'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80' },
  { id:5, nome:'Cabeleireiro', emoji:'✂️', hex:'#EC4899', rating:4.8, prestadores:34,  servicos:156, popular:true,  descricao:'Cortes de cabelo, penteados e tratamentos',             image:'https://images.unsplash.com/photo-1560869713-da86b9f3b925?auto=format&fit=crop&w=800&q=80' },
  { id:6, nome:'Manicure',     emoji:'💅', hex:'#F472B6', rating:4.7, prestadores:41,  servicos:189, popular:false, descricao:'Unhas de gel, verniz e cuidados das mãos',              image:'https://images.unsplash.com/photo-1610992015732-2449b0bb0a86?auto=format&fit=crop&w=800&q=80' },
  { id:7, nome:'Limpeza',      emoji:'🧹', hex:'#06B6D4', rating:4.5, prestadores:23,  servicos:67,  popular:false, descricao:'Limpeza doméstica e comercial',                         image:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80' },
  { id:8, nome:'Motorista',    emoji:'🚗', hex:'#14B8A6', rating:4.6, prestadores:67,  servicos:245, popular:true,  descricao:'Serviços de transporte e entregas',                     image:'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80' },
])

const featuredServices = ref<FeaturedService[]>([
  { id:1, titulo:'Reparação Elétrica Urgente',      descricao:'Reparação de curto-circuito e instalação de disjuntores', preco:'1.500', rating:4.9, providerName:'João Silva',  providerAvatar:'https://i.pravatar.cc/32?img=1', imagem:'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80', disponivel:true },
  { id:2, titulo:'Instalação de Ar Condicionado',   descricao:'Instalação e manutenção de AC split e janela',            preco:'3.000', rating:4.8, providerName:'Maria Santos', providerAvatar:'https://i.pravatar.cc/32?img=2', imagem:'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=800&q=80', disponivel:true },
  { id:3, titulo:'Penteado para Festa',              descricao:'Penteados profissionais para ocasiões especiais',         preco:'2.500', rating:5.0, providerName:'Ana Macie',    providerAvatar:'https://i.pravatar.cc/32?img=3', imagem:'https://images.unsplash.com/photo-1560869713-da86b9f3b925?auto=format&fit=crop&w=800&q=80', disponivel:false },
])

const faqs = ref<FAQ[]>([
  { pergunta:'Como encontro um prestador de confiança?',  resposta:'Todos os prestadores passam por verificação de identidade. Pode ver avaliações reais e o historial de serviços antes de contratar.' },
  { pergunta:'Os preços são negociáveis?',                resposta:'Os preços base são definidos pelos prestadores, mas pode negociar diretamente pelo chat antes de confirmar o serviço.' },
  { pergunta:'Como funciona o pagamento?',                resposta:'Pode pagar em dinheiro ou pelo nosso sistema seguro. O pagamento só é libertado após confirmar que o serviço foi concluído.' },
  { pergunta:'E se não gostar do serviço?',               resposta:'Temos uma política de satisfação garantida. A nossa equipa intervém para encontrar a melhor solução, incluindo reembolso se aplicável.' },
])

const filteredCategorias = computed<Categoria[]>(() => {
  let list = [...categorias.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c => c.nome.toLowerCase().includes(q) || c.descricao.toLowerCase().includes(q))
  }
  if (selectedFilter.value === 'popular') list = list.filter(c => c.popular)
  return list
})

const verCategoria = (cat: Categoria) => {
  void router.push(`/mobile/lista-prestadores?categoria=${encodeURIComponent(cat.nome)}`)
}
</script>

<style scoped lang="scss">
// =====================
//  TOKENS
// =====================
$ink:        #0A0A0F;
$ink-2:      #3D3D4E;
$ink-3:      #7B7B8E;
$surface:    #FFFFFF;
$surface-2:  #F7F7FA;
$surface-3:  #EDEDF2;
$accent:     #5B4BF5;
$accent-lt:  #EDE9FE;
$radius-sm:  8px;
$radius-md:  14px;
$radius-lg:  20px;
$radius-xl:  28px;

// =====================
//  BASE
// =====================
.sp-page {
  font-family: 'DM Sans', 'Nunito', sans-serif;
  background: $surface;
  color: $ink;
  overflow-x: hidden;
}

.sp-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

// =====================
//  HERO
// =====================
.sp-hero {
  position: relative;
  background: $ink;
  overflow: hidden;
  padding: 140px 0 0;

  &__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  &__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);

    &--1 {
      width: 500px; height: 500px;
      top: -150px; right: -80px;
      background: radial-gradient(circle, rgba(91,75,245,0.4) 0%, transparent 70%);
    }
    &--2 {
      width: 350px; height: 350px;
      bottom: 0; left: -60px;
      background: radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%);
    }
  }

  &__content {
    position: relative;
    z-index: 2;
    padding-bottom: 60px;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.8);
    font-size: 0.82rem;
    font-weight: 500;
    padding: 5px 14px;
    border-radius: 100px;
    margin-bottom: 24px;
    width: fit-content;
  }

  &__heading {
    font-size: clamp(2.6rem, 5.5vw, 4.8rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin: 0 0 20px;
  }

  &__sub {
    font-size: 1.1rem;
    color: rgba(255,255,255,0.55);
    margin: 0 0 40px;
    max-width: 520px;
    line-height: 1.6;
  }

  &__stats {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid rgba(255,255,255,0.06);
    margin-top: 20px;

    @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
  }
}

.sp-badge__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #4ADE80;
  box-shadow: 0 0 6px #4ADE80;
  flex-shrink: 0;
}

.sp-heading-accent {
  background: linear-gradient(135deg, $accent 0%, #A78BFA 50%, #F59E0B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

// Search
.sp-search {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 100px;
  padding: 6px 6px 6px 20px;
  max-width: 580px;
  backdrop-filter: blur(10px);
  gap: 12px;

  &__icon { color: rgba(255,255,255,0.4); flex-shrink: 0; display: flex; }

  &__input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    font-size: 0.95rem;
    font-family: inherit;

    &::placeholder { color: rgba(255,255,255,0.35); }
  }

  &__btn {
    background: $accent;
    color: #fff;
    border: none;
    border-radius: 100px;
    padding: 10px 22px;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover { background: lighten($accent, 6%); }
  }
}

// Stat row
.sp-stat {
  padding: 28px 20px;
  text-align: center;
  border-right: 1px solid rgba(255,255,255,0.06);

  &:last-child { border-right: none; }

  &__val {
    display: block;
    font-size: 1.7rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.03em;
  }

  &__label {
    display: block;
    font-size: 0.78rem;
    color: rgba(255,255,255,0.35);
    margin-top: 4px;
  }
}

// =====================
//  SECTIONS SHARED
// =====================
.sp-section {
  padding: 96px 0;
}

.sp-section-header {
  text-align: center;
  margin-bottom: 52px;

  &--row {
    text-align: left;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
}

.sp-section-label {
  display: inline-block;
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $accent;
  background: $accent-lt;
  padding: 4px 12px;
  border-radius: 100px;
  margin-bottom: 14px;
}

.sp-section-title {
  font-size: clamp(1.7rem, 3vw, 2.5rem);
  font-weight: 800;
  color: $ink;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 12px;
}

.sp-section-sub {
  font-size: 1rem;
  color: $ink-3;
  max-width: 440px;
  margin: 0 auto;
  line-height: 1.6;
}

// =====================
//  FILTERS
// =====================
.sp-filters {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 48px;
  flex-wrap: wrap;
}

.sp-filter-btn {
  padding: 9px 22px;
  border-radius: 100px;
  border: 1.5px solid $surface-3;
  background: $surface;
  color: $ink-3;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;

  &:hover { border-color: $accent; color: $accent; }

  &--active {
    background: $accent;
    border-color: $accent;
    color: #fff;
  }
}

// =====================
//  CATEGORIES
// =====================
.sp-categories { background: $surface-2; }

.sp-cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1024px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 720px)  { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 440px)  { grid-template-columns: 1fr; }
}

.sp-cat-card {
  background: $surface;
  border-radius: $radius-lg;
  overflow: hidden;
  border: 1.5px solid $surface-3;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25,0.46,0.45,0.94);
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.09);
    border-color: rgba(91,75,245,0.25);

    .sp-cat-card__arrow { opacity: 1; transform: translateX(0); }
  }

  &__img {
    height: 150px;
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
  }

  &__img-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.55));
  }

  &__icon-wrap {
    position: absolute;
    bottom: 14px;
    left: 14px;
    width: 44px;
    height: 44px;
    border-radius: $radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  &__rating {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(8px);
    color: #fff;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 100px;
  }

  &__body {
    padding: 18px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-size: 1rem;
    font-weight: 700;
    color: $ink;
    margin-bottom: 6px;
  }

  &__desc {
    font-size: 0.82rem;
    color: $ink-3;
    line-height: 1.5;
    flex: 1;
    margin-bottom: 14px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 0.75rem;
    color: $ink-3;
  }

  &__arrow {
    font-size: 1rem;
    color: $accent;
    opacity: 0;
    transform: translateX(-6px);
    transition: all 0.2s;
  }
}

.sp-load-more {
  text-align: center;
  margin-top: 48px;
}

.sp-btn-outline {
  padding: 12px 36px;
  border-radius: 100px;
  border: 1.5px solid $surface-3;
  background: transparent;
  color: $ink-2;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;

  &:hover { border-color: $accent; color: $accent; }
}

// =====================
//  FEATURED
// =====================
.sp-featured { background: $surface; }

.sp-link-btn {
  background: transparent;
  border: none;
  color: $accent;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
  white-space: nowrap;
  transition: opacity 0.2s;
  &:hover { opacity: 0.75; }
}

.sp-featured-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 560px) { grid-template-columns: 1fr; }
}

.sp-featured-card {
  background: $surface;
  border: 1.5px solid $surface-3;
  border-radius: $radius-lg;
  overflow: hidden;
  transition: all 0.25s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 36px rgba(0,0,0,0.07);
    border-color: rgba(91,75,245,0.2);
  }

  &__img-wrap { position: relative; }

  &__img { border-radius: 0; }

  &__badge {
    position: absolute;
    top: 12px;
    left: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 100px;
  }

  &__body { padding: 18px; }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__provider {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    color: $ink-2;
  }

  &__rating {
    font-size: 0.82rem;
    font-weight: 600;
    color: $ink-2;
  }

  &__title {
    font-size: 1rem;
    font-weight: 700;
    color: $ink;
    margin-bottom: 6px;
    line-height: 1.3;
  }

  &__desc {
    font-size: 0.83rem;
    color: $ink-3;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px solid $surface-3;
  }

  &__price-label { font-size: 0.72rem; color: $ink-3; }
  &__price { font-size: 1.15rem; font-weight: 800; color: $ink; letter-spacing: -0.02em; }
}

.sp-badge--green {
  background: #D1FAE5;
  color: #065F46;
}
.sp-badge--gray {
  background: $surface-3;
  color: $ink-3;
}

.sp-btn-solid {
  background: $accent;
  color: #fff;
  border: none;
  border-radius: 100px;
  padding: 9px 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  &:hover { background: lighten($accent, 6%); box-shadow: 0 6px 18px rgba(91,75,245,0.35); }
}

// =====================
//  FAQ
// =====================
.sp-faq { background: $surface-2; }

.sp-faq-list {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sp-faq-item {
  background: $surface;
  border: 1.5px solid $surface-3;
  border-radius: $radius-md;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;

  &--open {
    border-color: rgba(91,75,245,0.3);

    .sp-faq-item__q { color: $accent; }
  }

  &__q {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    font-size: 0.95rem;
    font-weight: 600;
    color: $ink;
    gap: 12px;
    transition: color 0.2s;
    user-select: none;
  }

  &__chevron {
    font-size: 1.3rem;
    font-weight: 400;
    color: $ink-3;
    flex-shrink: 0;
    line-height: 1;
  }

  &__a {
    padding: 0 22px 18px;
    font-size: 0.88rem;
    color: $ink-3;
    line-height: 1.7;
    border-top: 1px solid $surface-3;
    padding-top: 14px;
  }
}

// =====================
//  CTA FINAL
// =====================
.sp-cta-section {
  position: relative;
  background: $ink;
  overflow: hidden;
  padding: 100px 0;
}

.sp-cta-section__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sp-cta__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);

  &--1 {
    width: 450px; height: 450px;
    top: -150px; left: -80px;
    background: radial-gradient(circle, rgba(91,75,245,0.4) 0%, transparent 70%);
  }
  &--2 {
    width: 350px; height: 350px;
    bottom: -100px; right: -60px;
    background: radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%);
  }
}

.sp-cta__inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  flex-wrap: wrap;
}

.sp-cta__label {
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $accent;
  background: rgba(91,75,245,0.15);
  border: 1px solid rgba(91,75,245,0.3);
  padding: 4px 12px;
  border-radius: 100px;
  display: inline-block;
  margin-bottom: 18px;
}

.sp-cta__title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.04em;
  line-height: 1.05;
  margin: 0 0 16px;
}

.sp-cta__sub {
  font-size: 1rem;
  color: rgba(255,255,255,0.45);
  line-height: 1.6;
  margin: 0;
  max-width: 380px;
}

.sp-cta__right {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.sp-cta-white {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  color: $ink;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 14px 28px;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.25s;
  white-space: nowrap;

  &:hover {
    background: $accent-lt;
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(255,255,255,0.15);
  }
}

.sp-cta-ghost {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: rgba(255,255,255,0.55);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 14px 28px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 100px;
  text-decoration: none;
  backdrop-filter: blur(8px);
  transition: all 0.2s;
  white-space: nowrap;

  &:hover { color: #fff; border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.06); }
}
</style>
