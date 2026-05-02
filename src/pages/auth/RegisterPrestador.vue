<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="register-container">
      <q-card class="register-card" flat>
        <!-- Header -->
        <q-card-section class="register-header">
          <div class="header-icon">
            <q-icon name="handyman" size="32px" color="white" />
          </div>
          <div class="header-title">Criar Conta de Prestador</div>
          <div class="header-subtitle">
            Passo {{ currentStep }} de 5 • {{ getStepTitle(currentStep) }}
          </div>

          <!-- Progress Bar -->
          <div class="progress-container">
            <div class="progress-bar" :style="{ width: progressWidth }"></div>
          </div>
        </q-card-section>

        <!-- Step Indicators -->
        <div class="step-indicators">
          <div
            v-for="i in 5"
            :key="i"
            class="step-item"
            :class="{
              active: i === currentStep,
              completed: i < currentStep,
            }"
            @click="goToStep(i)"
          >
            <div class="step-circle">
              <q-icon v-if="i < currentStep" name="check" size="16px" />
              <span v-else>{{ i }}</span>
            </div>
            <div class="step-label">{{ getStepLabel(i) }}</div>
          </div>
        </div>

        <!-- Form -->
        <q-card-section class="q-px-xl q-py-lg">
          <!-- Step 1: Dados Básicos -->
          <div v-show="currentStep === 1">
            <div class="step-content">
              <div class="step-title">Dados Pessoais</div>

              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <div class="input-label">Nome Completo</div>
                  <q-input
                    v-model="formData.nome"
                    placeholder="Seu nome completo"
                    outlined
                    dense
                    class="custom-input"
                    :rules="[(val) => !!val || 'Nome é obrigatório']"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" color="grey-6" size="20px" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-6">
                  <div class="input-label">Número de Telefone</div>
                  <q-input
                    v-model="formData.telefone"
                    placeholder="84 123 4567"
                    prefix="+258"
                    mask="## ### ####"
                    unmasked-value
                    outlined
                    dense
                    class="custom-input"
                    :rules="[(val) => !!val || 'Telefone é obrigatório']"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="phone" color="grey-6" size="20px" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-6">
                  <div class="input-label">Email</div>
                  <q-input
                    v-model="formData.email"
                    placeholder="seu@email.com"
                    type="email"
                    outlined
                    dense
                    class="custom-input"
                    :rules="[(val) => !!val || 'Email é obrigatório']"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="email" color="grey-6" size="20px" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12">
                  <div class="input-label">Palavra-passe</div>
                  <q-input
                    v-model="formData.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Mínimo 6 caracteres"
                    outlined
                    dense
                    class="custom-input"
                    :rules="[
                      (val) => !!val || 'Palavra-passe é obrigatória',
                      (val) => val.length >= 6 || 'Mínimo 6 caracteres',
                    ]"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock" color="grey-6" size="20px" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="showPassword ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        color="grey-6"
                        @click="showPassword = !showPassword"
                      />
                    </template>
                  </q-input>

                  <div class="password-strength q-mt-sm" v-if="formData.password">
                    <div class="strength-bar">
                      <div
                        class="strength-fill"
                        :class="passwordStrength.class"
                        :style="{ width: passwordStrength.strength + '%' }"
                      ></div>
                    </div>
                    <div class="strength-text" :class="passwordStrength.class">
                      {{ passwordStrength.text }}
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="input-label">Confirmar Palavra-passe</div>
                  <q-input
                    v-model="formData.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="Digite novamente a sua palavra-passe"
                    outlined
                    dense
                    class="custom-input"
                    :rules="[
                      (val) => !!val || 'Confirmação de palavra-passe é obrigatória',
                      (val) => val === formData.password || 'As palavras-passe não coincidem',
                    ]"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock" color="grey-6" size="20px" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        color="grey-6"
                        @click="showConfirmPassword = !showConfirmPassword"
                      />
                    </template>
                  </q-input>

                  <div
                    v-if="
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                    "
                    class="confirm-error q-mt-sm"
                  >
                    <q-icon name="error" size="14px" />
                    <span>As palavras-passe não coincidem</span>
                  </div>
                  <div
                    v-else-if="
                      formData.confirmPassword && formData.password === formData.confirmPassword
                    "
                    class="confirm-success q-mt-sm"
                  >
                    <q-icon name="check_circle" size="14px" />
                    <span>Palavras-passe coincidem</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Perfil Profissional -->
          <div v-show="currentStep === 2">
            <div class="step-content">
              <div class="step-title">Perfil Profissional</div>

              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <div class="input-label">Foto de Perfil <span class="required">*</span></div>
                  <div class="photo-upload-area" @click="triggerFotoPerfilInput">
                    <input
                      ref="fotoPerfilInput"
                      type="file"
                      accept="image/*"
                      @change="handleFileUpload"
                      style="display: none"
                    />
                    <div class="photo-preview" v-if="formData.foto">
                      <img v-if="fotoPerfilPreview" :src="fotoPerfilPreview" alt="Preview" />
                      <q-btn
                        flat
                        round
                        dense
                        icon="close"
                        size="sm"
                        class="remove-photo"
                        @click.stop="removeFotoPerfil"
                      />
                    </div>
                    <div class="photo-placeholder" v-else>
                      <q-icon name="camera_alt" size="48px" color="grey-4" />
                      <div class="placeholder-text">Clique para adicionar foto</div>
                      <div class="placeholder-hint">JPG, PNG até 5MB</div>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="input-label">
                    Descrição do seu trabalho <span class="required">*</span>
                  </div>
                  <q-input
                    v-model="formData.descricao"
                    placeholder="Descreva sua experiência e serviços oferecidos"
                    outlined
                    type="textarea"
                    dense
                    class="custom-input"
                    :rules="[(val) => !!val || 'Descrição é obrigatória']"
                    bg-color="white"
                    autogrow
                  />
                </div>

                <div class="col-12">
                  <div class="input-label">
                    Categorias de Serviço <span class="required">*</span>
                  </div>
                  <q-select
                    v-model="formData.categorias"
                    :options="categoriasOptions"
                    label="Selecione as categorias"
                    multiple
                    outlined
                    dense
                    use-chips
                    emit-value
                    map-options
                    class="custom-input"
                    :rules="[(val) => (val && val.length > 0) || 'Selecione pelo menos uma']"
                    bg-color="white"
                    :loading="carregandoCategorias"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          Nenhuma categoria disponível
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <div v-if="carregandoCategorias" class="loading-categorias q-mt-sm">
                    <q-spinner size="20px" color="primary" />
                    <span class="q-ml-sm">Carregando categorias...</span>
                  </div>
                  <div v-else-if="categoriasOptions.length === 0 && !carregandoCategorias" class="error-categorias q-mt-sm text-negative">
                    <q-icon name="error" size="16px" />
                    <span class="q-ml-sm">Erro ao carregar categorias. Recarregue a página.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Portfólio -->
          <div v-show="currentStep === 3">
            <div class="step-content">
              <div class="step-title">Portfólio</div>
              <div class="step-subtitle">Adicione pelo menos 3 fotos dos seus trabalhos</div>

              <div class="row q-col-gutter-md">
                <div v-for="n in 3" :key="n" class="col-12 col-md-4">
                  <div class="portfolio-item">
                    <div class="portfolio-label">Foto {{ n }}</div>
                    <div class="photo-upload-area small" @click="triggerPortfolioInput(n - 1)">
                      <input
                        :ref="(el) => setPortfolioInputRef(el as HTMLInputElement | null, n - 1)"
                        type="file"
                        accept="image/*"
                        @change="(e) => handlePortfolioUpload(e, n - 1)"
                        style="display: none"
                      />
                      <div class="photo-preview small" v-if="formData.portfolio[n - 1]">
                        <img
                          v-if="portfolioPreviews[n - 1]"
                          :src="portfolioPreviews[n - 1] || ''"
                          alt="Preview"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          icon="close"
                          size="xs"
                          class="remove-photo small"
                          @click.stop="removePortfolioPhoto(n - 1)"
                        />
                      </div>
                      <div class="photo-placeholder small" v-else>
                        <q-icon name="add_photo_alternate" size="24px" color="grey-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Área e Disponibilidade -->
          <div v-show="currentStep === 4">
            <div class="step-content">
              <div class="step-title">Área e Disponibilidade</div>

              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <div class="input-label">
                    Raio de atuação (km) <span class="required">*</span>
                  </div>
                  <q-select
                    v-model="formData.raio"
                    :options="raioOptions"
                    label="Selecione o raio"
                    outlined
                    dense
                    class="custom-input"
                    :rules="[(val) => !!val || 'Selecione o raio']"
                    bg-color="white"
                    emit-value
                    map-options
                    @update:model-value="obterLocalizacaoAutomatica"
                  />
                  <div class="raio-hint q-mt-sm" v-if="formData.raio">
                    <q-icon name="info" size="12px" color="grey-6" />
                    <span
                      >Você atenderá clientes num raio de {{ formData.raio }} km a partir da sua
                      localização</span
                    >
                  </div>

                  <div v-if="carregandoLocalizacao" class="location-status loading q-mt-sm">
                    <q-spinner size="14px" color="primary" />
                    <span class="text-primary">Obtendo sua localização...</span>
                  </div>
                  <div v-else-if="localizacaoObtida" class="location-status success q-mt-sm">
                    <q-icon name="check_circle" size="14px" class="text-positive" />
                    <span class="text-positive">Localização definida com sucesso!</span>
                  </div>
                  <div
                    v-else-if="formData.raio && !localizacaoObtida && !carregandoLocalizacao"
                    class="location-status error q-mt-sm"
                  >
                    <q-icon name="error" size="14px" class="text-negative" />
                    <span class="text-negative"
                      >Não foi possível obter localização. Verifique as permissões do
                      navegador.</span
                    >
                  </div>
                </div>

                <div class="col-12">
                  <div class="input-label">Disponibilidade</div>
                  <div class="availability-grid two-columns">
                    <div v-for="dia in diasSemana" :key="dia.value" class="availability-item">
                      <div class="day-label">{{ dia.label }}</div>
                      <q-checkbox
                        :model-value="getDisponibilidadeAtivo(dia.value)"
                        @update:model-value="
                          (val: boolean) => setDisponibilidadeAtivo(dia.value, val)
                        "
                        label="Disponível"
                        dense
                      />
                      <q-input
                        v-if="getDisponibilidadeAtivo(dia.value)"
                        :model-value="getDisponibilidadeHorario(dia.value)"
                        @update:model-value="
                          (val: string | number | null) =>
                            setDisponibilidadeHorario(dia.value, val === null ? '' : String(val))
                        "
                        placeholder="8h-17h"
                        dense
                        outlined
                        class="time-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: Documentos e Revisão -->
          <div v-show="currentStep === 5">
            <div class="step-content">
              <div class="step-title">Documentos e Revisão</div>

              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <div class="input-label">
                    Documento de Identificação <span class="required">*</span>
                  </div>
                  <div class="document-upload" @click="triggerDocumentoInput">
                    <input
                      ref="documentoInput"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      @change="handleDocumentUpload"
                      style="display: none"
                    />
                    <div class="document-preview" v-if="formData.documento">
                      <q-icon
                        :name="getDocumentIcon(formData.documento.name)"
                        size="32px"
                        color="primary"
                      />
                      <div class="document-name">{{ formData.documento.name }}</div>
                      <q-btn
                        flat
                        round
                        dense
                        icon="close"
                        size="sm"
                        class="remove-document"
                        @click.stop="removeDocument"
                      />
                    </div>
                    <div class="document-placeholder" v-else>
                      <q-icon name="cloud_upload" size="32px" color="grey-4" />
                      <div class="placeholder-text">Clique para fazer upload</div>
                      <div class="placeholder-hint">PDF, JPG, PNG</div>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="review-card">
                    <div class="review-title">Revise seus dados</div>

                    <div class="review-section">
                      <div class="review-icon"><q-icon name="person" size="16px" /></div>
                      <div class="review-content">
                        <div class="review-label">Nome</div>
                        <div class="review-value">{{ formData.nome || '—' }}</div>
                      </div>
                    </div>

                    <div class="review-section">
                      <div class="review-icon"><q-icon name="phone" size="16px" /></div>
                      <div class="review-content">
                        <div class="review-label">Telefone</div>
                        <div class="review-value">{{ formData.telefone || '—' }}</div>
                      </div>
                    </div>

                    <div class="review-section">
                      <div class="review-icon"><q-icon name="work" size="16px" /></div>
                      <div class="review-content">
                        <div class="review-label">Categorias</div>
                        <div class="review-value">
                          <q-chip v-for="cat in formData.categorias" :key="cat" size="sm" dense>
                            {{ getCategoriaNome(cat) }}
                          </q-chip>
                          <span v-if="!formData.categorias.length">—</span>
                        </div>
                      </div>
                    </div>

                    <div class="review-section">
                      <div class="review-icon"><q-icon name="radar" size="16px" /></div>
                      <div class="review-content">
                        <div class="review-label">Raio de atuação</div>
                        <div class="review-value">
                          {{ formData.raio ? formData.raio + ' km' : '—' }}
                        </div>
                      </div>
                    </div>

                    <div class="review-section">
                      <div class="review-icon"><q-icon name="check_circle" size="16px" /></div>
                      <div class="review-content">
                        <div class="review-label">Localização</div>
                        <div class="review-value" :class="{ 'text-warning': !localizacaoObtida }">
                          {{
                            localizacaoObtida
                              ? '✅ Localização definida'
                              : '⚠️ Localização não definida'
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="terms-checkbox">
                    <q-checkbox
                      v-model="acceptTerms"
                      label="Li e aceito os Termos de Uso e Política de Privacidade"
                      color="primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Navigation -->
        <q-card-section class="q-px-xl q-pb-xl">
          <div class="row justify-between">
            <q-btn
              v-if="currentStep > 1"
              flat
              class="nav-btn prev-btn"
              label="Voltar"
              icon="arrow_back"
              @click="prevStep"
              no-caps
            />
            <div v-else></div>

            <q-btn
              v-if="currentStep < 5"
              class="nav-btn next-btn"
              label="Continuar"
              icon="arrow_forward"
              @click="nextStep"
              no-caps
            />
            <q-btn
              v-else
              class="register-btn"
              label="Finalizar Registo"
              :loading="loading"
              @click="handleRegister"
              no-caps
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
defineOptions({
  name: 'RegisterPrestador',
});

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { PRESTADOR_ENDPOINTS } from 'src/router/Api/prestador-endpoints';
import { usePrestadorStore } from 'src/stores/prestador-store';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();
const prestadorStore = usePrestadorStore();

const currentStep = ref(1);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const acceptTerms = ref(false);
const carregandoCategorias = ref(false);

const carregandoLocalizacao = ref(false);
const latitude = ref('');
const longitude = ref('');
const localizacaoObtida = ref(false);

const categoriasOptions = ref<{ label: string; value: number }[]>([]);
const raioOptions = ref<{ label: string; value: number }[]>([]);
const diasSemana = ref<{ label: string; value: string }[]>([]);

const progressWidth = computed(() => (currentStep.value / 5) * 100 + '%');

const passwordStrength = computed(() => {
  const pwd = formData.value.password;
  if (!pwd) return { strength: 0, class: 'weak', text: 'Fraca' };

  let strength = 0;
  if (pwd.length >= 6) strength += 25;
  if (pwd.length >= 8) strength += 25;
  if (/[A-Z]/.test(pwd)) strength += 25;
  if (/[0-9!@#$%^&*]/.test(pwd)) strength += 25;

  let strengthClass = 'weak';
  let strengthText = 'Fraca';

  if (strength <= 25) {
    strengthClass = 'weak';
    strengthText = 'Fraca';
  } else if (strength <= 50) {
    strengthClass = 'fair';
    strengthText = 'Razoável';
  } else if (strength <= 75) {
    strengthClass = 'good';
    strengthText = 'Boa';
  } else {
    strengthClass = 'strong';
    strengthText = 'Forte';
  }

  return { strength, class: strengthClass, text: strengthText };
});

const fotoPerfilInput = ref<HTMLInputElement | null>(null);
const documentoInput = ref<HTMLInputElement | null>(null);
const portfolioInput1 = ref<HTMLInputElement | null>(null);
const portfolioInput2 = ref<HTMLInputElement | null>(null);
const portfolioInput3 = ref<HTMLInputElement | null>(null);

const fotoPerfilPreview = ref<string | null>(null);
const portfolioPreviews = ref<(string | null)[]>([null, null, null]);

interface DisponibilidadeDia {
  ativo: boolean;
  horario: string;
}

interface Disponibilidade {
  [key: string]: DisponibilidadeDia;
}

interface FormData {
  nome: string;
  telefone: string;
  email: string;
  password: string;
  confirmPassword: string;
  foto: File | null;
  descricao: string;
  categorias: number[];
  portfolio: (File | null)[];
  raio: number | null;
  disponibilidade: Disponibilidade;
  documento: File | null;
  tipo: string;
}

const formData = ref<FormData>({
  nome: '',
  telefone: '',
  email: '',
  password: '',
  confirmPassword: '',
  foto: null,
  descricao: '',
  categorias: [],
  portfolio: [null, null, null],
  raio: null,
  disponibilidade: {},
  documento: null,
  tipo: 'prestador',
});

// Mapeamento de categorias por ID
const categoriasMap = ref<Map<number, string>>(new Map());

const getCategoriaNome = (id: number | string) => {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return categoriasMap.value.get(numId) || `Categoria ${id}`;
};

const obterLocalizacaoAutomatica = () => {
  if (!formData.value.raio) return;
  if (localizacaoObtida.value) return;
  if (carregandoLocalizacao.value) return;

  if (!navigator.geolocation) {
    $q.notify({
      type: 'warning',
      message: 'Seu navegador não suporta geolocalização.',
      position: 'top',
      timeout: 5000,
    });
    return;
  }

  carregandoLocalizacao.value = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude.value = position.coords.latitude.toFixed(6);
      longitude.value = position.coords.longitude.toFixed(6);
      localizacaoObtida.value = true;
      carregandoLocalizacao.value = false;

      $q.notify({
        type: 'positive',
        message: '📍 Posição definida com sucesso!',
        position: 'top',
        timeout: 3000,
        icon: 'my_location',
      });
    },
    (error) => {
      console.error('Erro de geolocalização:', error);
      carregandoLocalizacao.value = false;
      localizacaoObtida.value = false;

      $q.notify({
        type: 'negative',
        message: 'Não foi possível obter sua localização.',
        position: 'top',
        timeout: 5000,
        icon: 'error',
      });
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  );
};

const getDisponibilidadeAtivo = (diaKey: string): boolean => {
  return formData.value.disponibilidade[diaKey]?.ativo ?? false;
};

const setDisponibilidadeAtivo = (diaKey: string, value: boolean): void => {
  if (!formData.value.disponibilidade[diaKey]) {
    formData.value.disponibilidade[diaKey] = { ativo: false, horario: '' };
  }
  formData.value.disponibilidade[diaKey].ativo = value;
};

const getDisponibilidadeHorario = (diaKey: string): string => {
  return formData.value.disponibilidade[diaKey]?.horario ?? '';
};

const setDisponibilidadeHorario = (diaKey: string, value: string): void => {
  if (!formData.value.disponibilidade[diaKey]) {
    formData.value.disponibilidade[diaKey] = { ativo: false, horario: '' };
  }
  formData.value.disponibilidade[diaKey].horario = value;
};

const getStepTitle = (stepNum: number) => {
  const titles = [
    'Dados Básicos',
    'Perfil Profissional',
    'Portfólio',
    'Área e Disponibilidade',
    'Documentos e Revisão',
  ];
  return titles[stepNum - 1];
};

const getStepLabel = (stepNum: number) => {
  const labels = ['Dados', 'Perfil', 'Portfólio', 'Área', 'Revisão'];
  return labels[stepNum - 1];
};

const goToStep = (targetStep: number) => {
  if (targetStep < currentStep.value) {
    currentStep.value = targetStep;
  }
};

const prevStep = () => {
  currentStep.value--;
};

const nextStep = () => {
  if (!validateStep()) return;
  currentStep.value++;
};

const validateStep = () => {
  switch (currentStep.value) {
    case 1:
      if (!formData.value.nome) {
        $q.notify({ type: 'warning', message: 'Preencha o nome completo', position: 'top' });
        return false;
      }
      if (!formData.value.telefone) {
        $q.notify({ type: 'warning', message: 'Preencha o telefone', position: 'top' });
        return false;
      }
      if (!formData.value.email) {
        $q.notify({ type: 'warning', message: 'Preencha o email', position: 'top' });
        return false;
      }
      if (!formData.value.password) {
        $q.notify({ type: 'warning', message: 'Preencha a palavra-passe', position: 'top' });
        return false;
      }
      if (formData.value.password.length < 6) {
        $q.notify({
          type: 'warning',
          message: 'A palavra-passe deve ter pelo menos 6 caracteres',
          position: 'top',
        });
        return false;
      }
      if (formData.value.password !== formData.value.confirmPassword) {
        $q.notify({ type: 'warning', message: 'As palavras-passe não coincidem', position: 'top' });
        return false;
      }
      break;
    case 2:
      if (!formData.value.foto) {
        $q.notify({ type: 'warning', message: 'Adicione uma foto de perfil', position: 'top' });
        return false;
      }
      if (!formData.value.descricao) {
        $q.notify({
          type: 'warning',
          message: 'Preencha a descrição do seu trabalho',
          position: 'top',
        });
        return false;
      }
      if (formData.value.categorias.length === 0) {
        $q.notify({
          type: 'warning',
          message: 'Selecione pelo menos uma categoria',
          position: 'top',
        });
        return false;
      }
      break;
    case 3:
      if (
        !formData.value.portfolio[0] ||
        !formData.value.portfolio[1] ||
        !formData.value.portfolio[2]
      ) {
        $q.notify({
          type: 'warning',
          message: 'Adicione as 3 fotos do portfólio',
          position: 'top',
        });
        return false;
      }
      break;
    case 4:
      if (!formData.value.raio) {
        $q.notify({ type: 'warning', message: 'Selecione o raio de atuação', position: 'top' });
        return false;
      }
      if (!localizacaoObtida.value && !carregandoLocalizacao.value) {
        $q.notify({
          type: 'warning',
          message: 'Aguarde enquanto obtemos sua localização...',
          position: 'top',
          timeout: 3000,
        });
        obterLocalizacaoAutomatica();
        return false;
      }
      if (carregandoLocalizacao.value) {
        $q.notify({
          type: 'info',
          message: 'Obtendo localização... Por favor, aguarde.',
          position: 'top',
          timeout: 2000,
        });
        return false;
      }
      break;
    case 5:
      if (!formData.value.documento) {
        $q.notify({
          type: 'warning',
          message: 'Adicione o documento de identificação',
          position: 'top',
        });
        return false;
      }
      if (!acceptTerms.value) {
        $q.notify({ type: 'warning', message: 'Aceite os termos para continuar', position: 'top' });
        return false;
      }
      break;
  }
  return true;
};

const triggerFotoPerfilInput = () => fotoPerfilInput.value?.click();
const triggerDocumentoInput = () => documentoInput.value?.click();

const setPortfolioInputRef = (el: HTMLInputElement | null, index: number) => {
  if (index === 0) portfolioInput1.value = el;
  else if (index === 1) portfolioInput2.value = el;
  else if (index === 2) portfolioInput3.value = el;
};

const triggerPortfolioInput = (index: number) => {
  if (index === 0) portfolioInput1.value?.click();
  else if (index === 1) portfolioInput2.value?.click();
  else if (index === 2) portfolioInput3.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    $q.notify({ type: 'negative', message: 'O arquivo deve ter no máximo 5MB', position: 'top' });
    return;
  }

  formData.value.foto = file;
  fotoPerfilPreview.value = URL.createObjectURL(file);
};

const handlePortfolioUpload = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    $q.notify({ type: 'negative', message: 'O arquivo deve ter no máximo 5MB', position: 'top' });
    return;
  }

  formData.value.portfolio[index] = file;
  portfolioPreviews.value[index] = URL.createObjectURL(file);
};

const handleDocumentUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    $q.notify({ type: 'negative', message: 'O arquivo deve ter no máximo 5MB', position: 'top' });
    return;
  }

  formData.value.documento = file;
};

const removeFotoPerfil = () => {
  if (fotoPerfilPreview.value) URL.revokeObjectURL(fotoPerfilPreview.value);
  formData.value.foto = null;
  fotoPerfilPreview.value = null;
  if (fotoPerfilInput.value) fotoPerfilInput.value.value = '';
};

const removePortfolioPhoto = (index: number) => {
  if (portfolioPreviews.value[index]) URL.revokeObjectURL(portfolioPreviews.value[index]);
  formData.value.portfolio[index] = null;
  portfolioPreviews.value[index] = null;
  if (index === 0 && portfolioInput1.value) portfolioInput1.value.value = '';
  else if (index === 1 && portfolioInput2.value) portfolioInput2.value.value = '';
  else if (index === 2 && portfolioInput3.value) portfolioInput3.value.value = '';
};

const removeDocument = () => {
  formData.value.documento = null;
  if (documentoInput.value) documentoInput.value.value = '';
};

const getDocumentIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'picture_as_pdf';
  return 'image';
};

const carregarDadosAuxiliares = async () => {
  try {

    carregandoCategorias.value = true;

    // ✅ FORÇAR REFRESH para ignorar cache
    await prestadorStore.fetchServicoTiposOptions(true);


    categoriasOptions.value = prestadorStore.servicoTiposOptions.map((opt) => ({
      label: opt.label,
      value: Number(opt.value),
    }));


    // Criar mapa de categorias para exibir nomes
    categoriasOptions.value.forEach((opt) => {
      categoriasMap.value.set(opt.value, opt.label);
    });


    await prestadorStore.fetchRaioOpcoesOptions(true);
    raioOptions.value = prestadorStore.raioOpcoesOptions.map((opt) => ({
      label: opt.label,
      value: opt.value,
    }));

    await prestadorStore.fetchDiasOptions(true);
    diasSemana.value = prestadorStore.diasOptions.map((opt) => ({
      label: opt.label,
      value: opt.value,
    }));

    const disponibilidadeInicial: Disponibilidade = {};
    diasSemana.value.forEach((dia) => {
      disponibilidadeInicial[dia.value] = { ativo: false, horario: '' };
    });
    formData.value.disponibilidade = disponibilidadeInicial;

    if (categoriasOptions.value.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'Nenhuma categoria carregada. Tente recarregar a página.',
        position: 'top',
        timeout: 5000,
      });
    }
  } catch (error) {
    console.error('❌ Erro ao carregar dados auxiliares:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar categorias. Recarregue a página.',
      position: 'top',
      timeout: 5000,
    });
  } finally {
    carregandoCategorias.value = false;
  }
};

// ✅ HANDLE REGISTER CORRIGIDO - Envia categorias no formato correto
const handleRegister = async () => {
  if (!acceptTerms.value) {
    $q.notify({ type: 'warning', message: 'Aceite os termos para continuar', position: 'top' });
    return;
  }

  loading.value = true;
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('nome', formData.value.nome);
    formDataToSend.append('telefone', formData.value.telefone);
    formDataToSend.append('email', formData.value.email);
    formDataToSend.append('password', formData.value.password);
    formDataToSend.append('tipo', 'prestador');
    formDataToSend.append('descricao', formData.value.descricao);

    // ✅ Envia categorias como array de objetos com {value: id}
    const categoriasFormatadas = formData.value.categorias.map((id) => ({ value: id }));
    formDataToSend.append('categorias', JSON.stringify(categoriasFormatadas));

    formDataToSend.append('raio', String(formData.value.raio));
    formDataToSend.append('disponibilidade', JSON.stringify(formData.value.disponibilidade));

    if (latitude.value && longitude.value) {
      formDataToSend.append('latitude', latitude.value);
      formDataToSend.append('longitude', longitude.value);
     
    }

    if (formData.value.foto) {
      formDataToSend.append('foto', formData.value.foto);
    }

    formData.value.portfolio.forEach((file, i) => {
      if (file) {
        formDataToSend.append(`portfolio[${i}]`, file);
      }
    });

    if (formData.value.documento) {
      formDataToSend.append('documento', formData.value.documento);
    }

    const response = await api.post(PRESTADOR_ENDPOINTS.REGISTER, formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });

    if (response.data.success) {
      $q.notify({ type: 'positive', message: 'Registo efetuado com sucesso!', position: 'top' });
      setTimeout(() => {
        void router.push('/auth/login');
      }, 1500);
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.error || 'Erro ao registar',
        position: 'top',
      });
    }
  } catch (err) {
    console.error('Erro no registro:', err);
    $q.notify({ type: 'negative', message: 'Erro ao registar. Tente novamente.', position: 'top' });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await carregarDadosAuxiliares();
});
</script>

<style scoped lang="scss">
$purple-primary: #667eea;
$purple-secondary: #764ba2;
$purple-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$gray-50: #fafafa;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;
$gray-900: #212121;

.register-container {
  width: 100%;
  max-width: 800px;
  padding: 20px;
}

.register-card {
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  background: white;
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 30px 60px rgba(102, 126, 234, 0.15);
  }
}

.register-header {
  background: $purple-gradient;
  padding: 30px 40px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
  }
  .header-icon {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 15px;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }
  .header-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    margin-bottom: 5px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
  .header-subtitle {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    margin-bottom: 15px;
  }
}

.progress-container {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 15px;
  .progress-bar {
    height: 100%;
    background: white;
    transition: width 0.3s ease;
  }
}

.step-indicators {
  display: flex;
  padding: 20px 40px;
  background: $gray-50;
  border-bottom: 1px solid $gray-200;
  .step-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    position: relative;
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 20px;
      right: -30px;
      width: 60px;
      height: 2px;
      background: $gray-300;
    }
    &.completed:not(:last-child)::after {
      background: $purple-primary;
    }
    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: white;
      border: 2px solid $gray-300;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: $gray-600;
      margin-bottom: 8px;
      transition: all 0.3s ease;
    }
    &.active .step-circle {
      border-color: $purple-primary;
      background: $purple-primary;
      color: white;
      transform: scale(1.1);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }
    &.completed .step-circle {
      border-color: $purple-primary;
      background: $purple-primary;
      color: white;
    }
    .step-label {
      font-size: 0.8rem;
      color: $gray-600;
      font-weight: 500;
    }
    &.active .step-label {
      color: $purple-primary;
      font-weight: 600;
    }
  }
}

.step-content {
  min-height: 400px;
  .step-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: $gray-800;
    margin-bottom: 10px;
  }
  .step-subtitle {
    color: $gray-600;
    margin-bottom: 25px;
    padding-bottom: 10px;
    border-bottom: 2px solid $gray-200;
  }
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: $gray-700;
  margin-bottom: 5px;
  .optional {
    color: $gray-500;
    font-weight: normal;
    font-size: 0.8rem;
  }
  .required {
    color: #f56565;
    font-weight: normal;
    font-size: 0.8rem;
  }
}

.custom-input {
  :deep(.q-field__control) {
    border-radius: 15px;
    border: 1px solid $gray-200;
    transition: all 0.3s ease;
    &:hover {
      border-color: $purple-primary;
    }
  }
  :deep(.q-field__control:focus-within) {
    border-color: $purple-primary;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  :deep(.q-field__prepend) {
    padding-right: 10px;
  }
}

.location-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.85rem;

  &.loading {
    background: rgba(102, 126, 234, 0.1);
    color: $purple-primary;
  }

  &.success {
    background: rgba(72, 187, 120, 0.1);
    color: #48bb78;
  }

  &.error {
    background: rgba(245, 101, 101, 0.1);
    color: #f56565;
  }
}

.loading-categorias {
  display: flex;
  align-items: center;
  color: $purple-primary;
  font-size: 0.8rem;
}

.error-categorias {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
}

.raio-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  color: $gray-600;
}

.password-strength {
  .strength-bar {
    height: 4px;
    background: $gray-200;
    border-radius: 2px;
    overflow: hidden;
    .strength-fill {
      height: 100%;
      transition: width 0.3s ease;
      &.weak {
        background: #f56565;
      }
      &.fair {
        background: #ed8936;
      }
      &.good {
        background: #48bb78;
      }
      &.strong {
        background: #38a169;
      }
    }
  }
  .strength-text {
    font-size: 0.7rem;
    margin-top: 4px;
    &.weak {
      color: #f56565;
    }
    &.fair {
      color: #ed8936;
    }
    &.good {
      color: #48bb78;
    }
    &.strong {
      color: #38a169;
    }
  }
}

.confirm-error {
  color: #f56565;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.confirm-success {
  color: #48bb78;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.photo-upload-area {
  border: 2px dashed $gray-300;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    border-color: $purple-primary;
    background: rgba(102, 126, 234, 0.05);
  }
  &.small {
    padding: 10px;
  }
  .photo-preview {
    position: relative;
    display: inline-block;
    img {
      width: 120px;
      height: 120px;
      border-radius: 15px;
      object-fit: cover;
    }
    &.small img {
      width: 80px;
      height: 80px;
    }
    .remove-photo {
      position: absolute;
      top: -10px;
      right: -10px;
      background: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      &.small {
        top: -5px;
        right: -5px;
      }
      &:hover {
        background: $gray-100;
      }
    }
  }
  .photo-placeholder {
    .placeholder-text {
      margin-top: 10px;
      color: $gray-600;
      font-weight: 500;
    }
    .placeholder-hint {
      font-size: 0.8rem;
      color: $gray-500;
      margin-top: 5px;
    }
    &.small .placeholder-text {
      margin-top: 5px;
      font-size: 0.8rem;
    }
  }
}

.portfolio-item {
  .portfolio-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: $gray-700;
    margin-bottom: 8px;
  }
}

.availability-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;

  &.two-columns {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    @media (max-width: 599px) {
      grid-template-columns: 1fr;
    }
  }

  .availability-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px;
    background: $gray-50;
    border-radius: 12px;

    .day-label {
      min-width: 80px;
      font-weight: 500;
      color: $gray-700;
    }

    .time-input {
      width: 120px;
    }
  }
}

.document-upload {
  border: 2px dashed $gray-300;
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    border-color: $purple-primary;
    background: rgba(102, 126, 234, 0.05);
  }
  .document-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    .document-name {
      color: $gray-700;
      font-weight: 500;
    }
    .remove-document {
      background: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
  }
  .document-placeholder {
    .placeholder-text {
      margin-top: 10px;
      color: $gray-600;
      font-weight: 500;
    }
    .placeholder-hint {
      font-size: 0.8rem;
      color: $gray-500;
    }
  }
}

.review-card {
  background: $gray-50;
  border-radius: 20px;
  padding: 20px;
  margin-top: 20px;
  .review-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: $gray-800;
    margin-bottom: 15px;
  }
  .review-section {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid $gray-200;
    &:last-child {
      border-bottom: none;
    }
    .review-icon {
      width: 30px;
      height: 30px;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }
    .review-content {
      flex: 1;
      .review-label {
        font-size: 0.8rem;
        color: $gray-500;
        margin-bottom: 2px;
      }
      .review-value {
        font-size: 0.95rem;
        font-weight: 500;
        color: $gray-800;
        word-break: break-all;
        :deep(.q-chip) {
          margin: 2px;
        }
        &.text-warning {
          color: #ed8936;
        }
      }
    }
  }
}

.terms-checkbox {
  margin-top: 20px;
  :deep(.q-checkbox__label) {
    font-size: 0.9rem;
    color: $gray-600;
  }
}

.nav-btn {
  min-width: 120px;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 600;
  transition: all 0.3s ease;
  &.prev-btn {
    color: $gray-600;
    border: 2px solid $gray-300;
    &:hover {
      border-color: $purple-primary;
      color: $purple-primary;
    }
  }
  &.next-btn {
    background: $purple-gradient;
    color: white;
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 30px rgba(102, 126, 234, 0.4);
    }
  }
}

.register-btn {
  min-width: 160px;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 600;
  background: $purple-gradient;
  color: white;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 30px rgba(102, 126, 234, 0.4);
  }
  &:active {
    transform: translateY(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 599px) {
  .register-header {
    padding: 20px;
    .header-title {
      font-size: 1.5rem;
    }
  }
  .step-indicators {
    padding: 15px;
    .step-item {
      .step-circle {
        width: 30px;
        height: 30px;
        font-size: 0.9rem;
      }
      .step-label {
        font-size: 0.7rem;
      }
      &:not(:last-child)::after {
        width: 30px;
        right: -15px;
      }
    }
  }
  .availability-item {
    flex-wrap: wrap;
    .time-input {
      width: 100% !important;
    }
  }
}
</style>
