<template>
  <div class="prestador-configuracoes">

    <!-- ===== CABEÇALHO ===== -->
    <div class="page-header">
      <button class="back-btn" @click="() => void router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="page-title">Configurações</h1>
      <button class="menu-btn" @click="opcoes">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="12" cy="5" r="1"/>
          <circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
    </div>

    <!-- ===== SKELETON LOADING ===== -->
    <div v-if="carregamentoInicial" class="skeleton-container">
      <div class="skeleton-header">
        <div class="skeleton-back"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-menu"></div>
      </div>
      <div class="skeleton-list">
        <div class="skeleton-section"></div>
        <div v-for="i in 3" :key="i" class="skeleton-item">
          <div class="skeleton-icon"></div>
          <div class="skeleton-info">
            <div class="skeleton-line w-50"></div>
            <div class="skeleton-line w-30"></div>
          </div>
          <div class="skeleton-toggle"></div>
        </div>
        <div class="skeleton-section"></div>
        <div v-for="i in 2" :key="i" class="skeleton-item">
          <div class="skeleton-icon"></div>
          <div class="skeleton-info">
            <div class="skeleton-line w-50"></div>
            <div class="skeleton-line w-40"></div>
          </div>
          <div class="skeleton-toggle"></div>
        </div>
        <div class="skeleton-section"></div>
        <div v-for="i in 2" :key="i" class="skeleton-item-clickable">
          <div class="skeleton-icon"></div>
          <div class="skeleton-info">
            <div class="skeleton-line w-50"></div>
            <div class="skeleton-line w-30"></div>
          </div>
          <div class="skeleton-badge"></div>
        </div>
        <div class="skeleton-section"></div>
        <div class="skeleton-item">
          <div class="skeleton-icon"></div>
          <div class="skeleton-info">
            <div class="skeleton-line w-40"></div>
          </div>
          <div class="skeleton-select"></div>
        </div>
        <div class="skeleton-section"></div>
        <div v-for="i in 3" :key="i" class="skeleton-item-clickable">
          <div class="skeleton-icon"></div>
          <div class="skeleton-info">
            <div class="skeleton-line w-50"></div>
          </div>
          <div class="skeleton-chevron"></div>
        </div>
        <div class="skeleton-section"></div>
        <div class="skeleton-item">
          <div class="skeleton-icon"></div>
          <div class="skeleton-info">
            <div class="skeleton-line w-50"></div>
          </div>
          <div class="skeleton-badge"></div>
        </div>
      </div>
      <div class="skeleton-save"></div>
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <template v-else>

      <!-- Loading overlay -->
      <div v-if="configStore.isLoading" class="loading-overlay">
        <div class="loader"></div>
        <p>Carregando configurações...</p>
      </div>

      <template v-else>

        <!-- ===== SEÇÃO: NOTIFICAÇÕES ===== -->
        <div class="config-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <h2>Notificações</h2>
          </div>

          <div class="config-item">
            <div class="config-icon primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div class="config-info">
              <div class="config-title">Notificações push</div>
              <div class="config-desc">Receber alertas de novos pedidos</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="configStore.configuracoes.notificacoes_push" @change="configStore.hasChanges = true">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="config-item">
            <div class="config-icon primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L15 9M22 2l-7 7M22 2v6M22 2h-6"/>
                <rect x="2" y="8" width="16" height="13" rx="2"/>
                <line x1="10" y1="8" x2="10" y2="21"/>
              </svg>
            </div>
            <div class="config-info">
              <div class="config-title">Notificações por SMS</div>
              <div class="config-desc">Receber alertas via mensagem</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="configStore.configuracoes.notificacoes_sms" @change="configStore.hasChanges = true">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="config-item">
            <div class="config-icon primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M22 7l-10 7L2 7"/>
              </svg>
            </div>
            <div class="config-info">
              <div class="config-title">Notificações por email</div>
              <div class="config-desc">Receber resumos semanais</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="configStore.configuracoes.notificacoes_email" @change="configStore.hasChanges = true">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- ===== SEÇÃO: DISPONIBILIDADE ===== -->
        <div class="config-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <h2>Disponibilidade</h2>
          </div>

          <div class="config-item">
            <div class="config-icon secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="16" y2="17"/>
              </svg>
            </div>
            <div class="config-info">
              <div class="config-title">Aceitar pedidos automaticamente</div>
              <div class="config-desc">Novos pedidos são aceitos automaticamente</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="configStore.configuracoes.aceitar_automatico" @change="configStore.hasChanges = true">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="config-item">
            <div class="config-icon secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="18" y1="6" x2="6" y2="18"/>
              </svg>
            </div>
            <div class="config-info">
              <div class="config-title">Modo não perturbe</div>
              <div class="config-desc">Não receber novos pedidos</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="configStore.configuracoes.modo_nao_perturbe" @change="configStore.hasChanges = true">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- ===== SEÇÃO: PRIVACIDADE ===== -->
        <div class="config-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <h2>Privacidade</h2>
          </div>

          <div class="config-item">
            <div class="config-icon info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.03.03A10 10 0 0 0 12 17.66a10 10 0 0 0 6.37-2.63z"/>
              </svg>
            </div>
            <div class="config-info">
              <div class="config-title">Perfil público</div>
              <div class="config-desc">Aparecer nas buscas de clientes</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="configStore.configuracoes.perfil_publico" @change="configStore.hasChanges = true">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="config-item">
            <div class="config-icon info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="config-info">
              <div class="config-title">Mostrar localização exata</div>
              <div class="config-desc">Apenas após aceitar pedido</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="configStore.configuracoes.mostrar_localizacao" @change="configStore.hasChanges = true">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- ===== SEÇÃO: PAGAMENTOS ===== -->
        <div class="config-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            <h2>Pagamentos</h2>
          </div>

          <div class="config-item clickable" @click="configurarMPesa">
            <div class="config-icon success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
            </div>
            <div class="config-info">
              <div class="config-title">M-Pesa</div>
              <div class="config-desc">Configurar número para saques</div>
            </div>
            <div class="config-badge" :class="configStore.mpesaEstaConfigurado ? 'success' : 'grey'">
              {{ configStore.mpesaEstaConfigurado ? 'Configurado' : 'Não configurado' }}
            </div>
            <svg class="config-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>

          <div class="config-item clickable" @click="configurarConta">
            <div class="config-icon success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <div class="config-info">
              <div class="config-title">Conta bancária</div>
              <div class="config-desc">Dados para transferência</div>
            </div>
            <div class="config-badge" :class="configStore.contaEstaConfigurada ? 'success' : 'grey'">
              {{ configStore.contaEstaConfigurada ? 'Configurado' : 'Não configurado' }}
            </div>
            <svg class="config-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>

        <!-- ===== SEÇÃO: IDIOMA ===== -->
        <div class="config-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <h2>Idioma</h2>
          </div>

          <div class="config-item">
            <div class="config-icon warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9"/>
              </svg>
            </div>
            <div class="config-info">
              <div class="config-title">Idioma do app</div>
            </div>
            <select class="config-select" v-model="configStore.configuracoes.idioma" @change="configStore.hasChanges = true">
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>

        <!-- ===== SEÇÃO: SOBRE ===== -->
        <div class="config-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="none"/>
            </svg>
            <h2>Sobre</h2>
          </div>

          <div class="config-item clickable" @click="termosUso">
            <div class="config-icon grey">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div class="config-info">
              <div class="config-title">Termos de Uso</div>
            </div>
            <svg class="config-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>

          <div class="config-item clickable" @click="politicaPrivacidade">
            <div class="config-icon grey">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div class="config-info">
              <div class="config-title">Política de Privacidade</div>
            </div>
            <svg class="config-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>

          <div class="config-item" @click="versao">
            <div class="config-icon grey">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="config-info">
              <div class="config-title">Versão do app</div>
              <div class="config-desc">1.0.0</div>
            </div>
          </div>
        </div>

        <!-- ===== SEÇÃO: EXCLUIR CONTA ===== -->
        <div class="config-section delete-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            <h2 style="color: #EF4444;">Conta</h2>
          </div>

          <div class="config-item clickable delete-item" @click="confirmarExcluirConta">
            <div class="config-icon danger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
              </svg>
            </div>
            <div class="config-info">
              <div class="config-title" style="color: #EF4444;">Excluir minha conta</div>
              <div class="config-desc">Remover permanentemente sua conta e todos os dados</div>
            </div>
            <svg class="config-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>

        <!-- ===== BOTÃO SALVAR ===== -->
        <div class="save-container">
          <button class="save-btn" @click="salvarConfiguracoes" :disabled="configStore.isSaving || !configStore.hasChanges">
            <div v-if="configStore.isSaving" class="btn-spinner"></div>
            <span v-else>Salvar configurações</span>
          </button>
        </div>
      </template>
    </template>

    <!-- ===== MODAL M-PESA ===== -->
    <div class="modal-overlay" v-if="showMpesaDialog" @click="showMpesaDialog = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Configurar M-Pesa</h3>
          <button class="modal-close" @click="showMpesaDialog = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label class="input-label">Número do M-Pesa</label>
            <div class="phone-input">
              <span class="phone-prefix">+258</span>
              <input type="tel" v-model="mpesaNumero" placeholder="84 123 4567" class="phone-number" />
            </div>
          </div>
          <div class="input-group">
            <label class="input-label">Nome do titular</label>
            <input type="text" v-model="mpesaNome" placeholder="Como aparece no documento" class="text-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showMpesaDialog = false">Cancelar</button>
          <button class="btn-save" @click="salvarMpesa" :disabled="salvandoMpesa">
            <div v-if="salvandoMpesa" class="btn-spinner"></div>
            <span v-else>Salvar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL CONTA BANCÁRIA ===== -->
    <div class="modal-overlay" v-if="showContaDialog" @click="showContaDialog = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Configurar Conta Bancária</h3>
          <button class="modal-close" @click="showContaDialog = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label class="input-label">Banco</label>
            <input type="text" v-model="contaBanco" placeholder="Nome do banco" class="text-input" />
          </div>
          <div class="input-group">
            <label class="input-label">Número da conta</label>
            <input type="text" v-model="contaNumero" placeholder="Número da conta" class="text-input" />
          </div>
          <div class="input-group">
            <label class="input-label">Nome do titular</label>
            <input type="text" v-model="contaTitular" placeholder="Como aparece no documento" class="text-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showContaDialog = false">Cancelar</button>
          <button class="btn-save" @click="salvarConta" :disabled="salvandoConta">
            <div v-if="salvandoConta" class="btn-spinner"></div>
            <span v-else>Salvar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePrestadorConfiguracoesStore } from 'src/stores/prestador/prestador-configuracoes-store';

defineOptions({ name: 'PrestadorConfiguracoes' });

const router = useRouter();
const $q = useQuasar();

// ✅ APENAS UM STORE!
const configStore = usePrestadorConfiguracoesStore();

const carregamentoInicial = ref(true);
const showMpesaDialog = ref(false);
const showContaDialog = ref(false);
const salvandoMpesa = ref(false);
const salvandoConta = ref(false);

// Dados temporários dos modais
const mpesaNumero = ref('');
const mpesaNome = ref('');
const contaBanco = ref('');
const contaNumero = ref('');
const contaTitular = ref('');

// ===================== SALVAR CONFIGURAÇÕES =====================

const salvarConfiguracoes = async () => {
  const success = await configStore.salvarConfiguracoes();
  if (success) {
    $q.notify({ type: 'positive', message: 'Configurações salvas com sucesso!', position: 'top' });
  } else {
    $q.notify({ type: 'negative', message: configStore.error || 'Erro ao salvar configurações', position: 'top' });
  }
};
// ===================== FUNÇÕES =====================

const configurarMPesa = () => {
  mpesaNumero.value = configStore.mpesaData.numero;
  mpesaNome.value = configStore.mpesaData.nome;
  showMpesaDialog.value = true;
};

const salvarMpesa = async () => {
  if (!mpesaNumero.value) {
    $q.notify({ type: 'warning', message: 'Preencha o número do M-Pesa', position: 'top' });
    return;
  }

  salvandoMpesa.value = true;
  try {
    const success = await configStore.salvarMpesa({
      numero: mpesaNumero.value,
      nome: mpesaNome.value,
    });
    if (success) {
      $q.notify({ type: 'positive', message: 'M-Pesa configurado com sucesso!', position: 'top' });
      showMpesaDialog.value = false;
    } else {
      $q.notify({ type: 'negative', message: 'Erro ao configurar M-Pesa', position: 'top' });
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao configurar M-Pesa', position: 'top' });
  } finally {
    salvandoMpesa.value = false;
  }
};

const configurarConta = () => {
  contaBanco.value = configStore.contaData.banco;
  contaNumero.value = configStore.contaData.numero;
  contaTitular.value = configStore.contaData.titular;
  showContaDialog.value = true;
};

const salvarConta = async () => {
  if (!contaBanco.value || !contaNumero.value || !contaTitular.value) {
    $q.notify({ type: 'warning', message: 'Preencha todos os campos', position: 'top' });
    return;
  }

  salvandoConta.value = true;
  try {
    const success = await configStore.salvarConta({
      banco: contaBanco.value,
      numero: contaNumero.value,
      titular: contaTitular.value,
    });
    if (success) {
      $q.notify({ type: 'positive', message: 'Conta bancária configurada com sucesso!', position: 'top' });
      showContaDialog.value = false;
    } else {
      $q.notify({ type: 'negative', message: 'Erro ao configurar conta', position: 'top' });
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao configurar conta', position: 'top' });
  } finally {
    salvandoConta.value = false;
  }
};

const confirmarExcluirConta = () => {
  $q.dialog({
    title: 'Excluir conta',
    message: 'Tem certeza que deseja excluir permanentemente sua conta? Esta ação não pode ser desfeita e todos os seus dados serão removidos.',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Excluir', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      $q.loading.show({ message: 'Excluindo conta...' });
      const success = await configStore.excluirConta();
      $q.loading.hide();
      if (success) {
        $q.notify({ type: 'positive', message: 'Conta excluída com sucesso!', position: 'top' });
        await router.push('/auth/login');
      } else {
        $q.notify({ type: 'negative', message: configStore.error || 'Erro ao excluir conta', position: 'top' });
      }
    })();
  });
};

const opcoes = () => {
  $q.notify({ type: 'info', message: 'Opções em breve', position: 'top' });
};

const termosUso = () => {
  $q.notify({ type: 'info', message: 'Termos de Uso em breve', position: 'top' });
};

const politicaPrivacidade = () => {
  $q.notify({ type: 'info', message: 'Política de Privacidade em breve', position: 'top' });
};

const versao = () => {
  $q.notify({ type: 'info', message: 'Versão 1.0.0', position: 'top' });
};

// ===================== CARREGAMENTO INICIAL =====================

onMounted(async () => {
  carregamentoInicial.value = true;
  try {
    await configStore.carregarTodosDados();
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  } finally {
    setTimeout(() => { carregamentoInicial.value = false; }, 500);
  }
});
</script>

<style scoped lang="scss">
$accent: #5B4BF5;
$accent-light: rgba(91, 75, 245, 0.1);
$success: #10B981;
$success-light: rgba(16, 185, 129, 0.1);
$warning: #F59E0B;
$warning-light: rgba(245, 158, 11, 0.1);
$danger: #EF4444;
$danger-light: rgba(239, 68, 68, 0.1);
$info: #3B82F6;
$info-light: rgba(59, 130, 246, 0.1);
$dark: #0A0A0F;
$gray: #6B7280;
$gray-light: #F3F4F6;
$border: #E5E7EB;
$white: #FFFFFF;
$bg: #F4F4F8;
$radius: 16px;
$radius-sm: 12px;
$radius-xs: 8px;

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.prestador-configuracoes {
  background: $bg;
  min-height: 100vh;
  padding-bottom: 100px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $white;
  padding: 12px 16px;
  border-bottom: 1px solid $border;
  position: sticky;
  top: 0;
  z-index: 10;

  .back-btn, .menu-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gray-light;
    border: none;
    cursor: pointer;
    color: $gray;
    transition: all 0.2s;
    &:hover { background: $accent-light; color: $accent; }
  }

  .page-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: $dark;
    margin: 0;
  }
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;

  .loader {
    width: 48px;
    height: 48px;
    border: 3px solid $border;
    border-top-color: $accent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  p {
    margin-top: 16px;
    color: $gray;
    font-size: 0.85rem;
  }
}

// ===================== SKELETON =====================
.skeleton-container {
  .skeleton-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: $white;
    padding: 12px 16px;
    border-bottom: 1px solid $border;

    .skeleton-back, .skeleton-menu {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: $gray-light;
    }

    .skeleton-title {
      width: 100px;
      height: 24px;
      background: $gray-light;
      border-radius: $radius-xs;
    }
  }

  .skeleton-list {
    margin: 16px;
    background: $white;
    border-radius: $radius;
    overflow: hidden;
    border: 1px solid $border;
  }

  .skeleton-section {
    height: 40px;
    background: $gray-light;
    border-bottom: 1px solid $border;
  }

  .skeleton-item, .skeleton-item-clickable {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid $border;
  }

  .skeleton-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: $gray-light;
    margin-right: 16px;
  }

  .skeleton-info { flex: 1; }

  .skeleton-line {
    height: 14px;
    background: $gray-light;
    border-radius: 7px;
    margin: 4px 0;

    &.w-20 { width: 20%; }
    &.w-30 { width: 30%; }
    &.w-40 { width: 40%; }
    &.w-50 { width: 50%; }
  }

  .skeleton-toggle, .skeleton-badge, .skeleton-select, .skeleton-chevron {
    background: $gray-light;
    border-radius: 12px;
  }

  .skeleton-toggle { width: 40px; height: 24px; }
  .skeleton-badge { width: 80px; height: 24px; }
  .skeleton-select { width: 100px; height: 32px; border-radius: 8px; }
  .skeleton-chevron { width: 20px; height: 20px; border-radius: 4px; }

  .skeleton-save {
    margin: 16px;
    height: 48px;
    background: $gray-light;
    border-radius: $radius-sm;
  }
}

// ===================== CONFIG SECTIONS =====================
.config-section {
  background: $white;
  margin: 16px;
  border-radius: $radius;
  border: 1px solid $border;
  overflow: hidden;

  &.delete-section {
    border-color: rgba($danger, 0.3);
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: $gray-light;
  border-bottom: 1px solid $border;

  svg { color: $accent; }
  h2 { font-size: 0.85rem; font-weight: 600; color: $dark; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
}

.config-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid $border;
  transition: background 0.2s;

  &:last-child { border-bottom: none; }

  &.clickable {
    cursor: pointer;
    &:hover { background: $gray-light; }
  }

  &.delete-item:hover {
    background: rgba($danger, 0.05);
  }
}

.config-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;

  &.primary { background: $accent-light; color: $accent; }
  &.secondary { background: rgba($success, 0.1); color: $success; }
  &.info { background: $info-light; color: $info; }
  &.success { background: $success-light; color: $success; }
  &.warning { background: $warning-light; color: $warning; }
  &.grey { background: rgba($gray, 0.1); color: $gray; }
  &.danger { background: $danger-light; color: $danger; }
}

.config-info {
  flex: 1;

  .config-title {
    font-weight: 600;
    font-size: 0.9rem;
    color: $dark;
    margin-bottom: 2px;
  }

  .config-desc {
    font-size: 0.75rem;
    color: $gray;
  }
}

.config-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
  margin-right: 8px;

  &.success { background: $success-light; color: $success; }
  &.grey { background: rgba($gray, 0.1); color: $gray; }
}

.config-chevron { color: $gray; flex-shrink: 0; }

.config-select {
  padding: 8px 12px;
  border: 1px solid $border;
  border-radius: $radius-xs;
  font-size: 0.85rem;
  background: $white;
  color: $dark;
  cursor: pointer;
  outline: none;
  &:focus { border-color: $accent; }
}

// ===================== TOGGLE SWITCH =====================
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  flex-shrink: 0;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .toggle-slider {
      background-color: $accent;

      &:before {
        transform: translateX(24px);
      }
    }
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $border;
    transition: 0.3s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }
}

// ===================== SAVE BUTTON =====================
.save-container {
  padding: 16px;
  margin-top: 8px;
}

.save-btn {
  width: 100%;
  padding: 14px;
  background: $accent;
  border: none;
  border-radius: $radius-sm;
  font-size: 1rem;
  font-weight: 600;
  color: $white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: lighten($accent, 6%);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 0.6s linear infinite;
}

// ===================== MODAL =====================
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: $white;
  border-radius: $radius;
  width: 90%;
  max-width: 380px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid $border;

  h3 { font-size: 1rem; font-weight: 600; margin: 0; }

  .modal-close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $gray-light;
    border: none;
    cursor: pointer;
    color: $gray;
    &:hover { background: $border; }
  }
}

.modal-body { padding: 20px; }

.input-group { margin-bottom: 16px; }

.input-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: $dark;
  margin-bottom: 6px;
}

.phone-input {
  display: flex;
  align-items: center;
  border: 1px solid $border;
  border-radius: $radius-xs;
  overflow: hidden;

  .phone-prefix {
    padding: 12px;
    background: $gray-light;
    color: $gray;
    border-right: 1px solid $border;
  }

  .phone-number {
    flex: 1;
    padding: 12px;
    border: none;
    outline: none;
    font-size: 0.9rem;
    &:focus { background: $accent-light; }
  }
}

.text-input {
  width: 100%;
  padding: 12px;
  border: 1px solid $border;
  border-radius: $radius-xs;
  font-size: 0.9rem;
  outline: none;
  &:focus { border-color: $accent; }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid $border;

  .btn-cancel {
    padding: 8px 20px;
    background: transparent;
    border: none;
    font-size: 0.85rem;
    color: $gray;
    cursor: pointer;
    &:hover { color: $dark; }
  }

  .btn-save {
    min-width: 80px;
    padding: 8px 20px;
    background: $accent;
    border: none;
    border-radius: $radius-xs;
    font-size: 0.85rem;
    font-weight: 500;
    color: $white;
    cursor: pointer;
    &:hover:not(:disabled) { background: lighten($accent, 6%); }
    &:disabled { opacity: 0.5; }
  }
}
</style>
