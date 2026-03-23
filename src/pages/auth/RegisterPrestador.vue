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
          <div class="header-subtitle">Passo {{ step }} de 5 • {{ getStepTitle(step) }}</div>

          <!-- Progress Bar -->
          <div class="progress-container">
            <div class="progress-bar" :style="{ width: (step / 5) * 100 + '%' }"></div>
          </div>
        </q-card-section>

        <!-- Step Indicators -->
        <div class="step-indicators">
          <div
            v-for="i in 5"
            :key="i"
            class="step-item"
            :class="{
              active: i === step,
              completed: i < step,
            }"
            @click="goToStep(i)"
          >
            <div class="step-circle">
              <q-icon v-if="i < step" name="check" size="16px" />
              <span v-else>{{ i }}</span>
            </div>
            <div class="step-label">{{ getStepLabel(i) }}</div>
          </div>
        </div>

        <!-- Form -->
        <q-card-section class="q-px-xl q-py-lg">
          <!-- Step 1: Dados Básicos -->
          <div v-show="step === 1">
            <div class="step-content">
              <div class="step-title">Dados Pessoais</div>

              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <div class="input-label">Nome Completo</div>
                  <q-input
                    v-model="form.nome"
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
                    v-model="form.telefone"
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
                  <div class="input-label">Email <span class="optional">(opcional)</span></div>
                  <q-input
                    v-model="form.email"
                    placeholder="seu@email.com"
                    type="email"
                    outlined
                    dense
                    class="custom-input"
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
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Mínimo 6 caracteres"
                    outlined
                    dense
                    class="custom-input"
                    :rules="[(val) => val.length >= 6 || 'Mínimo 6 caracteres']"
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
                </div>

                <!-- Confirmar Password -->
                <div class="col-12">
                  <div class="input-label">Confirmar Palavra-passe</div>
                  <q-input
                    v-model="form.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="Digite novamente"
                    outlined
                    dense
                    class="custom-input"
                    :rules="[(val) => val === form.password || 'As palavras-passe não coincidem']"
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
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Perfil Profissional -->
          <div v-show="step === 2">
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
                      @change="(e) => handleFileUpload(e, 'foto')"
                      style="display: none"
                    />
                    <div class="photo-preview" v-if="form.foto">
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
                    v-model="form.descricao"
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
                    v-model="form.categorias"
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
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Portfólio -->
          <div v-show="step === 3">
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
                      <div class="photo-preview small" v-if="form.portfolio[n - 1]">
                        <img
                          v-if="portfolioPreviews[n - 1]"
                          :src="portfolioPreviews[n - 1] ?? ''"
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
          <div v-show="step === 4">
            <div class="step-content">
              <div class="step-title">Área e Disponibilidade</div>

              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <div class="input-label">
                    Raio de atuação (km) <span class="required">*</span>
                  </div>
                  <q-select
                    v-model="form.raio"
                    :options="raioOptions"
                    label="Selecione o raio"
                    outlined
                    dense
                    class="custom-input"
                    :rules="[(val) => !!val || 'Selecione o raio']"
                    bg-color="white"
                    emit-value
                    map-options
                  />
                </div>

                <div class="col-12">
                  <div class="input-label">Disponibilidade</div>
                  <div class="availability-grid">
                    <div v-for="dia in diasSemana" :key="dia.value" class="availability-item">
                      <div class="day-label">{{ dia.label }}</div>
                      <q-checkbox
                        v-model="form.disponibilidade[dia.value].ativo"
                        label="Disponível"
                        dense
                      />
                      <q-input
                        v-if="form.disponibilidade[dia.value].ativo"
                        v-model="form.disponibilidade[dia.value].horario"
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
          <div v-show="step === 5">
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
                    <div class="document-preview" v-if="form.documento">
                      <q-icon
                        :name="getDocumentIcon(form.documento.name)"
                        size="32px"
                        color="primary"
                      />
                      <div class="document-name">{{ form.documento.name }}</div>
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
                        <div class="review-value">{{ form.nome || '—' }}</div>
                      </div>
                    </div>

                    <div class="review-section">
                      <div class="review-icon"><q-icon name="phone" size="16px" /></div>
                      <div class="review-content">
                        <div class="review-label">Telefone</div>
                        <div class="review-value">{{ form.telefone || '—' }}</div>
                      </div>
                    </div>

                    <div class="review-section">
                      <div class="review-icon"><q-icon name="work" size="16px" /></div>
                      <div class="review-content">
                        <div class="review-label">Categorias</div>
                        <div class="review-value">
                          <q-chip v-for="cat in form.categorias" :key="cat" size="sm" dense>
                            {{ cat }}
                          </q-chip>
                          <span v-if="!form.categorias.length">—</span>
                        </div>
                      </div>
                    </div>

                    <div class="review-section">
                      <div class="review-icon"><q-icon name="location_on" size="16px" /></div>
                      <div class="review-content">
                        <div class="review-label">Raio de atuação</div>
                        <div class="review-value">{{ form.raio ? form.raio + ' km' : '—' }}</div>
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
              v-if="step > 1"
              flat
              class="nav-btn prev-btn"
              label="Voltar"
              icon="arrow_back"
              @click="prevStep"
              no-caps
            />
            <div v-else></div>

            <q-btn
              v-if="step < 5"
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

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePrestadorRegisterStore } from 'src/stores/prestador-store';
import { useQuasar } from 'quasar';

const router = useRouter();
const prestadorRegisterStore = usePrestadorRegisterStore();
const $q = useQuasar();

// Step control
const step = ref(1);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const acceptTerms = ref(false);

// File refs
const fotoPerfilInput = ref<HTMLInputElement | null>(null);
const documentoInput = ref<HTMLInputElement | null>(null);

// Refs individuais para portfólio
const portfolioInput1 = ref<HTMLInputElement | null>(null);
const portfolioInput2 = ref<HTMLInputElement | null>(null);
const portfolioInput3 = ref<HTMLInputElement | null>(null);

// Photo previews
const fotoPerfilPreview = ref<string | null>(null);
const portfolioPreviews = ref<(string | null)[]>([null, null, null]);

export interface DisponibilidadeDia {
  ativo: boolean;
  horario: string;
}

export interface Disponibilidade {
  segunda: DisponibilidadeDia;
  terca: DisponibilidadeDia;
  quarta: DisponibilidadeDia;
  quinta: DisponibilidadeDia;
  sexta: DisponibilidadeDia;
  sabado: DisponibilidadeDia;
  domingo: DisponibilidadeDia;
}

interface FormData {
  nome: string;
  telefone: string;
  email: string;
  password: string;
  confirmPassword: string;
  foto: File | null;
  descricao: string;
  categorias: string[];
  portfolio: (File | null)[];
  raio: number | null;
  disponibilidade: Disponibilidade;
  documento: File | null;
  tipo: string;
}

const form = ref<FormData>({
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
  disponibilidade: {
    segunda: { ativo: false, horario: '' },
    terca: { ativo: false, horario: '' },
    quarta: { ativo: false, horario: '' },
    quinta: { ativo: false, horario: '' },
    sexta: { ativo: false, horario: '' },
    sabado: { ativo: false, horario: '' },
    domingo: { ativo: false, horario: '' },
  },
  documento: null,
  tipo: 'prestador',
});

// Opções para selects
const categoriasOptions = [
  { label: 'Eletricista', value: 'Eletricista' },
  { label: 'Canalizador', value: 'Canalizador' },
  { label: 'Pintor', value: 'Pintor' },
  { label: 'Informático', value: 'Informático' },
  { label: 'Cabeleireiro', value: 'Cabeleireiro' },
  { label: 'Manicure', value: 'Manicure' },
  { label: 'Limpeza', value: 'Limpeza' },
  { label: 'Baby-sitter', value: 'Baby-sitter' },
  { label: 'Motorista', value: 'Motorista' },
  { label: 'Costureira', value: 'Costureira' },
];

const raioOptions = [
  { label: '2 km', value: 2 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '15 km', value: 15 },
  { label: '20 km', value: 20 },
  { label: '30 km', value: 30 },
];

const diasSemana = [
  { label: 'Segunda', value: 'segunda' as const },
  { label: 'Terça', value: 'terca' as const },
  { label: 'Quarta', value: 'quarta' as const },
  { label: 'Quinta', value: 'quinta' as const },
  { label: 'Sexta', value: 'sexta' as const },
  { label: 'Sábado', value: 'sabado' as const },
  { label: 'Domingo', value: 'domingo' as const },
];

// Helper functions
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

// Navigation
const goToStep = (targetStep: number) => {
  if (targetStep < step.value) {
    step.value = targetStep;
  }
};

const prevStep = () => {
  step.value--;
};

const nextStep = () => {
  if (!validateStep()) return;
  step.value++;
};

// Validation
const validateStep = () => {
  switch (step.value) {
    case 1: {
      if (!form.value.nome || !form.value.telefone || !form.value.password) {
        $q.notify({
          type: 'warning',
          message: 'Preencha todos os campos obrigatórios',
          position: 'top',
        });
        return false;
      }
      if (form.value.password.length < 6) {
        $q.notify({
          type: 'warning',
          message: 'A palavra-passe deve ter pelo menos 6 caracteres',
          position: 'top',
        });
        return false;
      }
      if (form.value.password !== form.value.confirmPassword) {
        $q.notify({
          type: 'warning',
          message: 'As palavras-passe não coincidem',
          position: 'top',
        });
        return false;
      }
      break;
    }
    case 2: {
      if (!form.value.foto || !form.value.descricao || form.value.categorias.length === 0) {
        $q.notify({
          type: 'warning',
          message: 'Preencha todos os campos obrigatórios (foto, descrição e categorias)',
          position: 'top',
        });
        return false;
      }
      break;
    }
    case 3: {
      const portfolioCompleto = form.value.portfolio.every((item) => item !== null);
      if (!portfolioCompleto) {
        $q.notify({
          type: 'warning',
          message: 'Adicione as 3 fotos do portfólio',
          position: 'top',
        });
        return false;
      }
      break;
    }
    case 4: {
      if (!form.value.raio) {
        $q.notify({
          type: 'warning',
          message: 'Selecione o raio de atuação',
          position: 'top',
        });
        return false;
      }
      break;
    }
    case 5: {
      if (!form.value.documento) {
        $q.notify({
          type: 'warning',
          message: 'Adicione o documento de identificação',
          position: 'top',
        });
        return false;
      }
      if (!acceptTerms.value) {
        $q.notify({
          type: 'warning',
          message: 'Aceite os termos para continuar',
          position: 'top',
        });
        return false;
      }
      break;
    }
  }
  return true;
};

// File handling methods
const triggerFotoPerfilInput = () => {
  fotoPerfilInput.value?.click();
};

const triggerDocumentoInput = () => {
  documentoInput.value?.click();
};

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

const handleFileUpload = (event: Event, field: string) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    $q.notify({
      type: 'negative',
      message: 'O arquivo deve ter no máximo 5MB',
      position: 'top',
    });
    return;
  }

  if (field === 'foto') {
    form.value.foto = file;
    fotoPerfilPreview.value = URL.createObjectURL(file);
  }
};

const handlePortfolioUpload = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    $q.notify({
      type: 'negative',
      message: 'O arquivo deve ter no máximo 5MB',
      position: 'top',
    });
    return;
  }

  form.value.portfolio[index] = file;
  portfolioPreviews.value[index] = URL.createObjectURL(file);
};

const handleDocumentUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    $q.notify({
      type: 'negative',
      message: 'O arquivo deve ter no máximo 5MB',
      position: 'top',
    });
    return;
  }

  form.value.documento = file;
};

const removeFotoPerfil = () => {
  form.value.foto = null;
  fotoPerfilPreview.value = null;
  if (fotoPerfilInput.value) {
    fotoPerfilInput.value.value = '';
  }
};

const removePortfolioPhoto = (index: number) => {
  form.value.portfolio[index] = null;
  portfolioPreviews.value[index] = null;

  if (index === 0 && portfolioInput1.value) {
    portfolioInput1.value.value = '';
  } else if (index === 1 && portfolioInput2.value) {
    portfolioInput2.value.value = '';
  } else if (index === 2 && portfolioInput3.value) {
    portfolioInput3.value.value = '';
  }
};

const removeDocument = () => {
  form.value.documento = null;
  if (documentoInput.value) {
    documentoInput.value.value = '';
  }
};

// Preview helpers
const getDocumentIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'picture_as_pdf';
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return 'image';
  return 'description';
};

// Registration
const handleRegister = async () => {
  if (!acceptTerms.value) {
    $q.notify({
      type: 'warning',
      message: 'Aceite os termos para continuar',
      position: 'top',
    });
    return;
  }

  // Sincronizar o store com os dados do componente
  prestadorRegisterStore.form.nome = form.value.nome;
  prestadorRegisterStore.form.telefone = form.value.telefone;
  prestadorRegisterStore.form.email = form.value.email;
  prestadorRegisterStore.form.password = form.value.password;
  prestadorRegisterStore.form.confirmPassword = form.value.confirmPassword;
  prestadorRegisterStore.form.foto = form.value.foto;
  prestadorRegisterStore.form.descricao = form.value.descricao;
  prestadorRegisterStore.form.categorias = form.value.categorias;
  prestadorRegisterStore.form.portfolio = form.value.portfolio;
  prestadorRegisterStore.form.raio = form.value.raio;
  prestadorRegisterStore.form.disponibilidade = form.value.disponibilidade;
  prestadorRegisterStore.form.documento = form.value.documento;
  prestadorRegisterStore.acceptTerms = acceptTerms.value;

  loading.value = true;
  try {
    const success = await prestadorRegisterStore.register();
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Registo efetuado com sucesso! Aguarde aprovação.',
        position: 'top',
      });
      setTimeout(() => {
        void router.push('/auth/login');
      }, 1500);
    }
  } catch (err: unknown) {
    let errorMessage = 'Erro ao registar';
    if (err && typeof err === 'object') {
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string };
      if (axiosError.response?.data?.error) {
        errorMessage = axiosError.response.data.error;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }
    }
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};
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

        :deep(.q-chip) {
          margin: 2px;
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
