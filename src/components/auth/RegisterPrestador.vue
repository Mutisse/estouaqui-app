<template>
  <div class="ea-register-form">
    <!-- Step 1: Dados Básicos -->
    <div v-show="currentStep === 1">
      <div class="step-title">Dados Pessoais</div>

      <div class="ea-input-group">
        <label class="ea-input-label">Nome Completo</label>
        <div class="ea-input-wrapper">
          <span class="ea-input-icon">
            <q-icon name="person" size="18px" />
          </span>
          <q-input
            v-model="formData.nome"
            outlined
            dense
            placeholder="Seu nome completo"
            class="ea-input-field"
            dark
            color="white"
            :rules="[(val) => !!val || 'Nome é obrigatório']"
          />
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <div class="ea-input-group">
            <label class="ea-input-label">Telefone</label>
            <div class="ea-input-wrapper">
              <span class="ea-input-icon">
                <q-icon name="phone" size="18px" />
              </span>
              <q-input
                v-model="formData.telefone"
                outlined
                dense
                placeholder="84 123 4567"
                class="ea-input-field"
                dark
                color="white"
                :rules="[(val) => !!val || 'Telefone é obrigatório']"
              />
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="ea-input-group">
            <label class="ea-input-label">Email</label>
            <div class="ea-input-wrapper">
              <span class="ea-input-icon">
                <q-icon name="email" size="18px" />
              </span>
              <q-input
                v-model="formData.email"
                type="email"
                outlined
                dense
                placeholder="seu@email.com"
                class="ea-input-field"
                dark
                color="white"
                :rules="[(val) => !!val || 'Email é obrigatório']"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="ea-input-group">
        <label class="ea-input-label">Palavra-passe</label>
        <div class="ea-input-wrapper">
          <span class="ea-input-icon">
            <q-icon name="lock" size="18px" />
          </span>
          <q-input
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            outlined
            dense
            placeholder="Mínimo 6 caracteres"
            class="ea-input-field"
            dark
            color="white"
            :rules="[(val) => val.length >= 6 || 'Mínimo 6 caracteres']"
          >
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
        </div>
        <div class="password-strength" v-if="formData.password">
          <div class="strength-bar" :class="passwordStrength.class"></div>
          <div class="strength-text" :class="passwordStrength.class">
            {{ passwordStrength.text }}
          </div>
        </div>
      </div>

      <div class="ea-input-group">
        <label class="ea-input-label">Confirmar Palavra-passe</label>
        <div class="ea-input-wrapper">
          <span class="ea-input-icon">
            <q-icon name="lock" size="18px" />
          </span>
          <q-input
            v-model="formData.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            outlined
            dense
            placeholder="Digite novamente"
            class="ea-input-field"
            dark
            color="white"
            :rules="[(val) => val === formData.password || 'As palavras-passe não coincidem']"
          >
            <template #append>
              <q-icon
                :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>
        </div>
      </div>
    </div>

    <!-- Step 2: Perfil Profissional -->
    <div v-show="currentStep === 2">
      <div class="step-title">Perfil Profissional</div>

      <div class="ea-input-group">
        <label class="ea-input-label">Foto de Perfil</label>
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
            <q-icon name="camera_alt" size="32px" />
            <div class="placeholder-text">Clique para adicionar foto</div>
          </div>
        </div>
      </div>

      <div class="ea-input-group">
        <label class="ea-input-label">Descrição do seu trabalho</label>
        <div class="ea-input-wrapper">
          <span class="ea-input-icon">
            <q-icon name="description" size="18px" />
          </span>
          <q-input
            v-model="formData.descricao"
            type="textarea"
            outlined
            dense
            placeholder="Descreva sua experiência e serviços oferecidos"
            class="ea-input-field"
            dark
            color="white"
            autogrow
            :rules="[(val) => !!val || 'Descrição é obrigatória']"
          />
        </div>
      </div>

      <div class="ea-input-group">
        <label class="ea-input-label">Categorias de Serviço</label>
        <div class="ea-input-wrapper">
          <span class="ea-input-icon">
            <q-icon name="category" size="18px" />
          </span>
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
            class="ea-input-field"
            dark
            color="white"
            :loading="carregandoCategorias"
            :rules="[(val) => (val && val.length > 0) || 'Selecione pelo menos uma']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">Nenhuma categoria disponível</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>
    </div>

    <!-- Step 3: Portfólio -->
    <div v-show="currentStep === 3">
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
                <q-icon name="add_photo_alternate" size="24px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 4: Área e Disponibilidade -->
    <div v-show="currentStep === 4">
      <div class="step-title">Área e Disponibilidade</div>

      <div class="ea-input-group">
        <label class="ea-input-label">Raio de atuação (km)</label>
        <div class="ea-input-wrapper">
          <span class="ea-input-icon">
            <q-icon name="radar" size="18px" />
          </span>
          <q-select
            v-model="formData.raio"
            :options="raioOptions"
            label="Selecione o raio"
            outlined
            dense
            class="ea-input-field"
            dark
            color="white"
            emit-value
            map-options
            @update:model-value="obterLocalizacaoAutomatica"
            :rules="[(val) => !!val || 'Selecione o raio']"
          />
        </div>
      </div>

      <div class="location-status" v-if="carregandoLocalizacao">
        <q-spinner size="14px" color="primary" />
        <span>Obtendo sua localização...</span>
      </div>
      <div class="location-status success" v-else-if="localizacaoObtida">
        <q-icon name="check_circle" size="14px" />
        <span>Localização definida com sucesso!</span>
      </div>

      <div class="ea-input-group">
        <label class="ea-input-label">Disponibilidade</label>
        <div class="availability-grid two-columns">
          <div v-for="dia in diasSemana" :key="dia.value" class="availability-item">
            <div class="day-label">{{ dia.label }}</div>
            <q-checkbox
              :model-value="getDisponibilidadeAtivo(dia.value)"
              @update:model-value="(val) => setDisponibilidadeAtivo(dia.value, val)"
              label="Disponível"
              dense
              dark
            />
            <q-input
              v-if="getDisponibilidadeAtivo(dia.value)"
              :model-value="getDisponibilidadeHorario(dia.value)"
              @update:model-value="(val) => setDisponibilidadeHorario(dia.value, String(val))"
              placeholder="8h-17h"
              dense
              outlined
              class="time-input"
              dark
              color="white"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Step 5: Documentos e Revisão -->
    <div v-show="currentStep === 5">
      <div class="step-title">Documentos e Revisão</div>

      <div class="ea-input-group">
        <label class="ea-input-label">Documento de Identificação</label>
        <div class="document-upload" @click="triggerDocumentoInput">
          <input
            ref="documentoInput"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            @change="handleDocumentUpload"
            style="display: none"
          />
          <div class="document-preview" v-if="formData.documento">
            <q-icon :name="getDocumentIcon(formData.documento.name)" size="32px" color="primary" />
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
            <q-icon name="cloud_upload" size="32px" />
            <div class="placeholder-text">Clique para fazer upload</div>
            <div class="placeholder-hint">PDF, JPG, PNG até 5MB</div>
          </div>
        </div>
      </div>

      <div class="review-card">
        <div class="review-title">Revise seus dados</div>
        <div class="review-item">
          <div class="review-label">Nome</div>
          <div class="review-value">{{ formData.nome || '—' }}</div>
        </div>
        <div class="review-item">
          <div class="review-label">Telefone</div>
          <div class="review-value">{{ formData.telefone || '—' }}</div>
        </div>
        <div class="review-item">
          <div class="review-label">Email</div>
          <div class="review-value">{{ formData.email || '—' }}</div>
        </div>
        <div class="review-item">
          <div class="review-label">Categorias</div>
          <div class="review-value">
            <q-chip v-for="cat in formData.categorias" :key="cat" size="sm" dense dark>
              {{ getCategoriaNome(cat) }}
            </q-chip>
            <span v-if="!formData.categorias.length">—</span>
          </div>
        </div>
        <div class="review-item">
          <div class="review-label">Raio de atuação</div>
          <div class="review-value">{{ formData.raio ? formData.raio + ' km' : '—' }}</div>
        </div>
        <div class="review-item">
          <div class="review-label">Localização</div>
          <div class="review-value" :class="{ 'text-warning': !localizacaoObtida }">
            {{ localizacaoObtida ? '✅ Localização definida' : '⚠️ Localização não definida' }}
          </div>
        </div>
      </div>

      <div class="terms-checkbox">
        <q-checkbox
          v-model="acceptTerms"
          label="Li e aceito os Termos de Uso"
          color="primary"
          dark
        />
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="row justify-between q-mt-lg">
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
        @click="() => handleRegister()"
        no-caps
      />
    </div>

    <!-- Step Indicator -->
    <div class="step-indicator">
      <span>Passo {{ currentStep }} de 5</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { PRESTADOR_ENDPOINTS } from 'src/router/Api/prestador-endpoints';
import { usePrestadorPublicStore } from 'src/stores/prestador/prestador-public-store';

defineOptions({ name: 'RegisterPrestadorForm' });

const router = useRouter();
const $q = useQuasar();
const publicStore = usePrestadorPublicStore();

const currentStep = ref(1);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const acceptTerms = ref(false);
const carregandoCategorias = ref(false);
const carregandoLocalizacao = ref(false);
const localizacaoObtida = ref(false);
const latitude = ref('');
const longitude = ref('');

const fotoPerfilInput = ref<HTMLInputElement | null>(null);
const documentoInput = ref<HTMLInputElement | null>(null);
const portfolioInput1 = ref<HTMLInputElement | null>(null);
const portfolioInput2 = ref<HTMLInputElement | null>(null);
const portfolioInput3 = ref<HTMLInputElement | null>(null);

const fotoPerfilPreview = ref<string | null>(null);
const portfolioPreviews = ref<(string | null)[]>([null, null, null]);

const categoriasOptions = ref<{ label: string; value: number }[]>([]);
const raioOptions = ref<{ label: string; value: number }[]>([]);
const diasSemana = ref<{ label: string; value: string }[]>([]);

const categoriasMap = ref<Map<number, string>>(new Map());

const formData = ref({
  nome: '',
  telefone: '',
  email: '',
  password: '',
  confirmPassword: '',
  foto: null as File | null,
  descricao: '',
  categorias: [] as number[],
  portfolio: [null, null, null] as (File | null)[],
  raio: null as number | null,
  documento: null as File | null,
});

const disponibilidade = reactive<Record<string, { ativo: boolean; horario: string }>>({});

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

const getCategoriaNome = (id: number | string) => {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return categoriasMap.value.get(numId) || `Categoria ${id}`;
};

// Funções auxiliares para disponibilidade
const getDisponibilidadeAtivo = (diaKey: string): boolean => {
  return disponibilidade[diaKey]?.ativo ?? false;
};

const setDisponibilidadeAtivo = (diaKey: string, value: boolean): void => {
  if (!disponibilidade[diaKey]) {
    disponibilidade[diaKey] = { ativo: false, horario: '' };
  }
  disponibilidade[diaKey].ativo = value;
};

const getDisponibilidadeHorario = (diaKey: string): string => {
  return disponibilidade[diaKey]?.horario ?? '';
};

const setDisponibilidadeHorario = (diaKey: string, value: string): void => {
  if (!disponibilidade[diaKey]) {
    disponibilidade[diaKey] = { ativo: false, horario: '' };
  }
  disponibilidade[diaKey].horario = value;
};

const obterLocalizacaoAutomatica = () => {
  if (!formData.value.raio) return;
  if (localizacaoObtida.value) return;
  if (carregandoLocalizacao.value) return;

  if (!navigator.geolocation) {
    $q.notify({ type: 'warning', message: 'Seu navegador não suporta geolocalização.' });
    return;
  }

  carregandoLocalizacao.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude.value = position.coords.latitude.toFixed(6);
      longitude.value = position.coords.longitude.toFixed(6);
      localizacaoObtida.value = true;
      carregandoLocalizacao.value = false;
      $q.notify({ type: 'positive', message: '📍 Localização definida com sucesso!' });
    },
    () => {
      carregandoLocalizacao.value = false;
      $q.notify({ type: 'negative', message: 'Não foi possível obter sua localização.' });
    },
  );
};

const validateStep = (): boolean => {
  switch (currentStep.value) {
    case 1:
      if (!formData.value.nome) {
        $q.notify({ type: 'warning', message: 'Preencha o nome completo' });
        return false;
      }
      if (!formData.value.telefone) {
        $q.notify({ type: 'warning', message: 'Preencha o telefone' });
        return false;
      }
      if (!formData.value.email) {
        $q.notify({ type: 'warning', message: 'Preencha o email' });
        return false;
      }
      if (!formData.value.password || formData.value.password.length < 6) {
        $q.notify({ type: 'warning', message: 'Palavra-passe deve ter pelo menos 6 caracteres' });
        return false;
      }
      if (formData.value.password !== formData.value.confirmPassword) {
        $q.notify({ type: 'warning', message: 'As palavras-passe não coincidem' });
        return false;
      }
      break;
    case 2:
      if (!formData.value.foto) {
        $q.notify({ type: 'warning', message: 'Adicione uma foto de perfil' });
        return false;
      }
      if (!formData.value.descricao) {
        $q.notify({ type: 'warning', message: 'Preencha a descrição do seu trabalho' });
        return false;
      }
      if (formData.value.categorias.length === 0) {
        $q.notify({ type: 'warning', message: 'Selecione pelo menos uma categoria' });
        return false;
      }
      break;
    case 3:
      if (
        !formData.value.portfolio[0] ||
        !formData.value.portfolio[1] ||
        !formData.value.portfolio[2]
      ) {
        $q.notify({ type: 'warning', message: 'Adicione as 3 fotos do portfólio' });
        return false;
      }
      break;
    case 4:
      if (!formData.value.raio) {
        $q.notify({ type: 'warning', message: 'Selecione o raio de atuação' });
        return false;
      }
      if (!localizacaoObtida.value && !carregandoLocalizacao.value) {
        obterLocalizacaoAutomatica();
        $q.notify({ type: 'info', message: 'Obtendo localização...' });
        return false;
      }
      break;
    case 5:
      if (!formData.value.documento) {
        $q.notify({ type: 'warning', message: 'Adicione o documento de identificação' });
        return false;
      }
      if (!acceptTerms.value) {
        $q.notify({ type: 'warning', message: 'Aceite os termos para continuar' });
        return false;
      }
      break;
  }
  return true;
};

const nextStep = () => {
  if (validateStep()) {
    currentStep.value++;
  }
};

const prevStep = () => {
  currentStep.value--;
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
    $q.notify({ type: 'negative', message: 'Arquivo deve ter no máximo 5MB' });
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
    $q.notify({ type: 'negative', message: 'Arquivo deve ter no máximo 5MB' });
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
    $q.notify({ type: 'negative', message: 'Arquivo deve ter no máximo 5MB' });
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
};

const removeDocument = () => {
  formData.value.documento = null;
  if (documentoInput.value) documentoInput.value.value = '';
};

const getDocumentIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext === 'pdf' ? 'picture_as_pdf' : 'image';
};

const carregarDadosAuxiliares = async () => {
  try {
    carregandoCategorias.value = true;
    await publicStore.fetchServicoTiposOptions(true);
    categoriasOptions.value = publicStore.servicoTiposOptions.map(
      (opt: { label: string; value: number }) => ({
        label: opt.label,
        value: Number(opt.value),
      }),
    );
    categoriasOptions.value.forEach((opt) => {
      categoriasMap.value.set(opt.value, opt.label);
    });

    await publicStore.fetchRaioOpcoesOptions(true);
    raioOptions.value = publicStore.raioOpcoesOptions.map(
      (opt: { label: string; value: number }) => ({
        label: opt.label,
        value: opt.value,
      }),
    );

    await publicStore.fetchDiasOptions(true);
    diasSemana.value = publicStore.diasOptions.map((opt: { label: string; value: string }) => ({
      label: opt.label,
      value: opt.value,
    }));

    diasSemana.value.forEach((dia) => {
      disponibilidade[dia.value] = { ativo: false, horario: '' };
    });
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    $q.notify({ type: 'negative', message: 'Erro ao carregar categorias.' });
  } finally {
    carregandoCategorias.value = false;
  }
};

const handleRegister = async () => {
  if (!validateStep()) return;

  loading.value = true;
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('nome', formData.value.nome);
    formDataToSend.append('telefone', formData.value.telefone);
    formDataToSend.append('email', formData.value.email);
    formDataToSend.append('password', formData.value.password);
    formDataToSend.append('descricao', formData.value.descricao);

    const categoriasFormatadas = formData.value.categorias.map((id) => ({ value: id }));
    formDataToSend.append('categorias', JSON.stringify(categoriasFormatadas));
    formDataToSend.append('raio', String(formData.value.raio));
    formDataToSend.append('disponibilidade', JSON.stringify(disponibilidade));

    if (latitude.value && longitude.value) {
      formDataToSend.append('latitude', latitude.value);
      formDataToSend.append('longitude', longitude.value);
    }

    if (formData.value.foto) formDataToSend.append('foto', formData.value.foto);
    formData.value.portfolio.forEach((file, i) => {
      if (file) formDataToSend.append(`portfolio[${i}]`, file);
    });
    if (formData.value.documento) formDataToSend.append('documento', formData.value.documento);

    const response = await api.post(PRESTADOR_ENDPOINTS.REGISTER, formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });

    if (response.data.success) {
      $q.notify({ type: 'positive', message: 'Registo efetuado com sucesso!' });
      setTimeout(() => {
        void router.push('/');
      }, 1500);
    } else {
      $q.notify({ type: 'negative', message: response.data.error || 'Erro ao registar' });
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao registar. Tente novamente.' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void carregarDadosAuxiliares();
});
</script>

<style scoped lang="scss">
$accent: #5b4bf5;

.ea-register-form {
  width: 100%;
}

.step-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 24px;
  text-align: center;
}

.step-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  margin-bottom: 20px;
}

.step-indicator {
  text-align: center;
  margin-top: 20px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.ea-input-group {
  margin-bottom: 20px;
}

.ea-input-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.ea-input-wrapper {
  position: relative;
}

.ea-input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $accent;
  z-index: 3;
  pointer-events: none;
}

.ea-input-field {
  :deep(.q-field__control) {
    background: transparent !important;
    border-radius: 14px;
    min-height: 48px;
    padding-left: 44px;

    &::before {
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  :deep(.q-field__control--filled),
  :deep(.q-field__control--dirty),
  :deep(.q-field__control--focused) {
    background: transparent !important;
  }

  :deep(.q-field__control:hover::before) {
    border-color: rgba(255, 255, 255, 0.4);
  }

  :deep(.q-field--focused .q-field__control::before) {
    border-color: $accent !important;
  }

  :deep(.q-field__native) {
    color: #fff;
    padding-left: 0;
  }

  :deep(.q-field__native::placeholder) {
    color: rgba(255, 255, 255, 0.4);
  }

  :deep(.q-field__append) {
    position: absolute;
    right: 8px;
  }

  :deep(.q-field--outlined .q-field__control) {
    background: transparent !important;
  }
}

.password-strength {
  margin-top: 8px;

  .strength-bar {
    height: 3px;
    border-radius: 2px;
    transition: all 0.3s;

    &.weak {
      width: 25%;
      background: #f56565;
    }
    &.fair {
      width: 50%;
      background: #fbbf24;
    }
    &.good {
      width: 75%;
      background: #48bb78;
    }
    &.strong {
      width: 100%;
      background: #38a169;
    }
  }

  .strength-text {
    font-size: 0.7rem;
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.5);
  }
}

.photo-upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: $accent;
    background: rgba(255, 255, 255, 0.05);
  }

  &.small {
    padding: 10px;
  }

  .photo-preview {
    position: relative;
    display: inline-block;

    img {
      width: 100px;
      height: 100px;
      border-radius: 12px;
      object-fit: cover;
    }

    &.small img {
      width: 80px;
      height: 80px;
    }

    .remove-photo {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #fff;
      color: #666;
    }
  }

  .photo-placeholder {
    .placeholder-text {
      margin-top: 8px;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
    }
  }
}

.document-upload {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  cursor: pointer;

  &:hover {
    border-color: $accent;
    background: rgba(255, 255, 255, 0.05);
  }

  .document-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;

    .document-name {
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .document-placeholder {
    .placeholder-text {
      margin-top: 10px;
      color: rgba(255, 255, 255, 0.6);
    }
    .placeholder-hint {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.4);
    }
  }
}

.location-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.85rem;
  margin-bottom: 16px;

  &.success {
    background: rgba(72, 187, 120, 0.1);
    color: #48bb78;
  }
}

.availability-grid {
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
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;

  .day-label {
    min-width: 80px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
  }

  .time-input {
    width: 120px;
  }
}

.portfolio-item {
  .portfolio-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 8px;
  }
}

.review-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;

  .review-title {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .review-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    &:last-child {
      border-bottom: none;
    }

    .review-label {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .review-value {
      font-weight: 500;
      color: #fff;
      text-align: right;
    }
  }
}

.terms-checkbox {
  margin-top: 20px;
}

.nav-btn {
  min-width: 120px;
  padding: 10px 20px;
  border-radius: 100px;
  font-weight: 600;

  &.prev-btn {
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.3);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }

  &.next-btn {
    background: $accent;
    color: #fff;

    &:hover {
      background: lighten($accent, 6%);
      transform: translateY(-2px);
    }
  }
}

.register-btn {
  background: $accent;
  color: #fff;
  min-width: 140px;
  padding: 10px 20px;
  border-radius: 100px;
  font-weight: 600;

  &:hover {
    background: lighten($accent, 6%);
    transform: translateY(-2px);
  }
}

.text-warning {
  color: #f59e0b !important;
}
</style>
