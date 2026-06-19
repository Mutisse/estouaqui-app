<template>
  <div class="ea-register-form">
    <!-- Loading inicial -->
    <div v-if="carregandoDadosIniciais" class="loading-container">
      <q-spinner size="40px" color="primary" />
      <p class="loading-text">A carregar dados do sistema...</p>
    </div>

    <!-- Conteúdo principal -->
    <div v-else>
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
              :error="hasError('nome')"
              :error-message="getErrorMessage('nome')"
              @update:model-value="clearError('nome')"
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
                  :error="hasError('telefone')"
                  :error-message="getErrorMessage('telefone')"
                  @update:model-value="clearError('telefone')"
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
                  :error="hasError('email')"
                  :error-message="getErrorMessage('email')"
                  @update:model-value="clearError('email')"
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
              :error="hasError('password')"
              :error-message="getErrorMessage('password')"
              @update:model-value="clearError('password')"
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
          <div class="password-strength" v-if="formData.password && passwordStrength">
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
              :error="hasError('confirmPassword')"
              :error-message="getErrorMessage('confirmPassword')"
              @update:model-value="clearError('confirmPassword')"
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
              @change="onFotoPerfilChange"
              style="display: none"
            />
            <div class="photo-preview" v-if="fotoPreview">
              <img :src="fotoPreview" alt="Preview" />
              <q-btn
                flat
                round
                dense
                icon="close"
                size="sm"
                class="remove-photo"
                @click.stop="removerFotoPerfil"
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
              :error="hasError('descricao')"
              :error-message="getErrorMessage('descricao')"
              @update:model-value="clearError('descricao')"
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
              :error="hasError('categorias')"
              :error-message="getErrorMessage('categorias')"
              @update:model-value="clearError('categorias')"
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
              <div class="photo-upload-area small" @click="() => triggerPortfolioInput(n - 1)">
                <input
                  :ref="(el) => setPortfolioInputRef(el as HTMLInputElement | null, n - 1)"
                  type="file"
                  accept="image/*"
                  @change="(e) => onPortfolioChange(e, n - 1)"
                  style="display: none"
                />
                <div class="photo-preview small" v-if="portfolioPreviews[n - 1]">
                  <img :src="portfolioPreviews[n - 1] || ''" alt="Preview" />
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    size="xs"
                    class="remove-photo small"
                    @click.stop="() => removerPortfolioPhoto(n - 1)"
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
          <label class="ea-input-label">Raio de atuação</label>
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
              :error="hasError('raio')"
              :error-message="getErrorMessage('raio')"
              @update:model-value="onRaioChange"
            />
          </div>
        </div>

        <!-- ===== LOCALIZAÇÃO OBRIGATÓRIA ===== -->
        <div class="ea-input-group">
          <label class="ea-input-label">📍 Localização <span class="required">*</span></label>

          <div class="location-container">
            <!-- Status -->
            <div class="location-status" v-if="carregandoLocalizacao">
              <q-spinner size="16px" color="primary" />
              <span>Obtendo localização...</span>
            </div>

            <div class="location-status success" v-else-if="localizacaoObtida && localizacaoData">
              <q-icon name="check_circle" size="16px" color="positive" />
              <span>
                ✅ Localização definida:
                <strong>{{ localizacaoData.lat.toFixed(6) }}</strong>,
                <strong>{{ localizacaoData.lng.toFixed(6) }}</strong>
              </span>
              <q-btn
                flat
                dense
                round
                icon="close"
                size="xs"
                color="negative"
                @click="limparLocalizacao"
                title="Limpar localização"
              />
            </div>

            <div class="location-status error" v-else-if="hasError('localizacao')">
              <q-icon name="error" size="16px" color="negative" />
              <span class="text-negative">{{ getErrorMessage('localizacao') }}</span>
            </div>

            <div class="location-status" v-else>
              <q-icon name="place" size="16px" color="grey-6" />
              <span class="text-grey-6">Localização não definida</span>
            </div>

            <!-- Ações -->
            <div class="location-actions">
              <q-btn
                unelevated
                label="Obter localização automática"
                icon="my_location"
                color="primary"
                @click="handleObterLocalizacao"
                :loading="carregandoLocalizacao"
                :disable="carregandoLocalizacao"
                class="location-btn"
              />

              <q-btn
                flat
                label="Inserir manualmente"
                icon="edit"
                color="grey-6"
                @click="abrirModalLocalizacao"
                class="location-btn"
              />
            </div>

            <!-- Modal de Localização Manual -->
            <div v-if="mostrarModalLocalizacao" class="manual-location">
              <div class="manual-location-header">
                <span class="manual-location-title">Inserir coordenadas manualmente</span>
                <q-btn flat round dense icon="close" @click="mostrarModalLocalizacao = false" />
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input
                    v-model="latitudeManual"
                    label="Latitude"
                    outlined
                    dense
                    dark
                    type="number"
                    step="0.000001"
                    placeholder="-25.969200"
                    :error="!!erroLatitudeManual"
                    :error-message="erroLatitudeManual"
                    @update:model-value="erroLatitudeManual = ''"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="longitudeManual"
                    label="Longitude"
                    outlined
                    dense
                    dark
                    type="number"
                    step="0.000001"
                    placeholder="32.573200"
                    :error="!!erroLongitudeManual"
                    :error-message="erroLongitudeManual"
                    @update:model-value="erroLongitudeManual = ''"
                  />
                </div>
              </div>
              <div class="manual-location-actions">
                <q-btn flat label="Cancelar" @click="mostrarModalLocalizacao = false" />
                <q-btn
                  unelevated
                  label="Definir localização"
                  color="primary"
                  @click="definirLocalizacaoManualFn"
                />
              </div>
              <div class="manual-location-hint">
                <q-icon name="info" size="12px" />
                Dica: Você pode obter coordenadas no Google Maps (clique com o botão direito)
              </div>
            </div>
          </div>
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
                placeholder="08:00-17:00"
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
              @change="onDocumentoChange"
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
                @click.stop="removerDocumento"
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
            <div class="review-value" :class="{ 'text-success': localizacaoObtida, 'text-warning': !localizacaoObtida }">
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
            :error="hasError('terms')"
          />
          <div v-if="hasError('terms')" class="error-message">
            {{ getErrorMessage('terms') }}
          </div>
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
          @click="handleRegister"
          no-caps
        />
      </div>

      <!-- Step Indicator -->
      <div class="step-indicator">
        <span>Passo {{ currentStep }} de 5</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePrestadorRegisterStore } from 'src/stores/prestador/prestador-register-store';

defineOptions({ name: 'RegisterPrestadorForm' });

const router = useRouter();
const $q = useQuasar();
const registerStore = usePrestadorRegisterStore();

// Estados locais
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const portfolioInputs = ref<(HTMLInputElement | null)[]>([null, null, null]);
const fotoPerfilInput = ref<HTMLInputElement | null>(null);
const documentoInput = ref<HTMLInputElement | null>(null);
const carregandoDadosIniciais = ref(true);

// 🔥 LOCALIZAÇÃO MANUAL
const mostrarModalLocalizacao = ref(false);
const latitudeManual = ref('');
const longitudeManual = ref('');
const erroLatitudeManual = ref('');
const erroLongitudeManual = ref('');

// 🔥 DADOS LOCAIS (não vêm do backend)
const raioOptions = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '15 km', value: 15 },
  { label: '20 km', value: 20 },
  { label: '30 km', value: 30 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
];

const diasSemana = [
  { label: 'Segunda-feira', value: 'monday' },
  { label: 'Terça-feira', value: 'tuesday' },
  { label: 'Quarta-feira', value: 'wednesday' },
  { label: 'Quinta-feira', value: 'thursday' },
  { label: 'Sexta-feira', value: 'friday' },
  { label: 'Sábado', value: 'saturday' },
  { label: 'Domingo', value: 'sunday' },
];

// Bindings para a store
const loading = computed(() => registerStore.loading);
const currentStep = computed(() => registerStore.currentStep);
const acceptTerms = computed({
  get: () => registerStore.acceptTerms,
  set: (value) => (registerStore.acceptTerms = value),
});
const formData = computed(() => registerStore.formData);
const fotoPreview = computed(() => registerStore.fotoPreview);
const portfolioPreviews = computed(() => registerStore.portfolioPreviews);
const passwordStrength = computed(() => registerStore.passwordStrength);
const validationErrors = computed(() => registerStore.validationErrors);
const carregandoCategorias = computed(() => registerStore.carregandoCategorias);
const carregandoLocalizacao = computed(() => registerStore.carregandoLocalizacao);
const localizacaoObtida = computed(() => registerStore.localizacaoObtida);
const localizacaoData = computed(() => registerStore.localizacaoData);
const categoriasOptions = computed(() => registerStore.categoriasOptions);

// Helpers para erros
const hasError = (field: string): boolean => {
  return validationErrors.value.some((err) => err.field === field);
};

const getErrorMessage = (field: string): string => {
  return validationErrors.value.find((err) => err.field === field)?.message || '';
};

const clearError = (field: string): void => {
  const index = registerStore.validationErrors.findIndex((err) => err.field === field);
  if (index !== -1) {
    registerStore.validationErrors.splice(index, 1);
  }
};

// Navegação
const nextStep = (): void => {
  const success = registerStore.nextStep();
  if (!success) {
    const firstError = validationErrors.value[0];
    if (firstError) {
      $q.notify({
        type: 'warning',
        message: firstError.message,
        position: 'top',
      });
    }
  }
};

const prevStep = (): void => {
  registerStore.prevStep();
};

// Disponibilidade
const getDisponibilidadeAtivo = (diaKey: string): boolean => {
  return registerStore.getDisponibilidadeAtivo(diaKey);
};

const setDisponibilidadeAtivo = (diaKey: string, value: boolean): void => {
  registerStore.setDisponibilidadeAtivo(diaKey, value);
};

const getDisponibilidadeHorario = (diaKey: string): string => {
  return registerStore.getDisponibilidadeHorario(diaKey);
};

const setDisponibilidadeHorario = (diaKey: string, value: string): void => {
  registerStore.setDisponibilidadeHorario(diaKey, value);
};

// Localização
const onRaioChange = async (): Promise<void> => {
  if (formData.value.raio && !localizacaoObtida.value && !carregandoLocalizacao.value) {
    try {
      await registerStore.obterLocalizacaoAutomatica();
      $q.notify({
        type: 'positive',
        message: '📍 Localização definida com sucesso!',
        position: 'top',
      });
    } catch {
      $q.notify({
        type: 'negative',
        message: 'Não foi possível obter sua localização.',
        position: 'top',
      });
    }
  }
};

const handleObterLocalizacao = async (): Promise<void> => {
  try {
    await registerStore.obterLocalizacaoAutomatica();
    $q.notify({
      type: 'positive',
      message: '📍 Localização obtida com sucesso!',
      position: 'top',
      timeout: 2000,
    });
    clearError('localizacao');
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao obter localização';
    $q.notify({
      type: 'negative',
      message: msg,
      position: 'top',
      timeout: 3000,
    });
  }
};

const abrirModalLocalizacao = (): void => {
  mostrarModalLocalizacao.value = true;
  latitudeManual.value = localizacaoData.value?.lat?.toString() || '';
  longitudeManual.value = localizacaoData.value?.lng?.toString() || '';
};

const definirLocalizacaoManualFn = (): void => {
  erroLatitudeManual.value = '';
  erroLongitudeManual.value = '';

  const lat = parseFloat(latitudeManual.value);
  const lng = parseFloat(longitudeManual.value);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    erroLatitudeManual.value = 'Latitude inválida (-90 a 90)';
    return;
  }

  if (isNaN(lng) || lng < -180 || lng > 180) {
    erroLongitudeManual.value = 'Longitude inválida (-180 a 180)';
    return;
  }

  registerStore.definirLocalizacaoManual(lat, lng);
  mostrarModalLocalizacao.value = false;
  clearError('localizacao');

  $q.notify({
    type: 'positive',
    message: '📍 Localização definida manualmente!',
    position: 'top',
    timeout: 2000,
  });
};

const limparLocalizacao = (): void => {
  registerStore.limparLocalizacao();
  $q.notify({
    type: 'info',
    message: 'Localização removida. Defina uma nova.',
    position: 'top',
    timeout: 2000,
  });
};

// Uploads
const triggerFotoPerfilInput = (): void => {
  fotoPerfilInput.value?.click();
};

const triggerDocumentoInput = (): void => {
  documentoInput.value?.click();
};

const triggerPortfolioInput = (index: number): void => {
  portfolioInputs.value[index]?.click();
};

const setPortfolioInputRef = (el: HTMLInputElement | null, index: number): void => {
  portfolioInputs.value[index] = el;
};

const onFotoPerfilChange = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const success = registerStore.uploadFotoPerfil(file);
    if (!success) {
      $q.notify({ type: 'negative', message: getErrorMessage('arquivo'), position: 'top' });
    }
  }
};

const onPortfolioChange = (event: Event, index: number): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const success = registerStore.uploadPortfolio(file, index);
    if (!success) {
      $q.notify({ type: 'negative', message: getErrorMessage('arquivo'), position: 'top' });
    }
  }
};

const onDocumentoChange = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const success = registerStore.uploadDocumento(file);
    if (!success) {
      $q.notify({ type: 'negative', message: getErrorMessage('arquivo'), position: 'top' });
    }
  }
};

const removerFotoPerfil = (): void => {
  registerStore.removerFotoPerfil();
  if (fotoPerfilInput.value) {
    fotoPerfilInput.value.value = '';
  }
};

const removerPortfolioPhoto = (index: number): void => {
  registerStore.removerPortfolio(index);
  const input = portfolioInputs.value[index];
  if (input) {
    input.value = '';
  }
};

const removerDocumento = (): void => {
  registerStore.removerDocumento();
  if (documentoInput.value) {
    documentoInput.value.value = '';
  }
};

const getDocumentIcon = (filename: string): string => {
  return registerStore.getDocumentIcon(filename);
};

const getCategoriaNome = (id: number): string => {
  return registerStore.getCategoriaNome(id);
};

// Registro
const handleRegister = async (): Promise<void> => {
  const result = await registerStore.registrarPrestador();

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: result.message || 'Registo efetuado com sucesso!',
      position: 'top',
      icon: 'check_circle',
    });

    registerStore.resetForm();

    setTimeout(() => {
      void router.push('/');
    }, 1500);
  } else {
    $q.notify({
      type: 'negative',
      message: result.error || 'Erro ao registar. Tente novamente.',
      position: 'top',
    });
  }
};

// Inicialização
onMounted(async () => {
  carregandoDadosIniciais.value = true;

  try {
    await registerStore.carregarDadosAuxiliares();
  } catch (error) {
    const erroMsg = error instanceof Error ? error.message : 'Erro ao carregar dados';
    $q.notify({
      type: 'negative',
      message: erroMsg,
      position: 'top',
      timeout: 5000,
    });
  } finally {
    carregandoDadosIniciais.value = false;
  }
});
</script>

<style scoped lang="scss">
$accent: #5b4bf5;

.ea-register-form {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;

  .loading-text {
    margin-top: 16px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }
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

  .required {
    color: #ef4444;
    margin-left: 2px;
  }
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

// ===== LOCALIZAÇÃO =====
.location-container {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.location-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 0.85rem;

  &.success {
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
  }

  &.error {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
  }
}

.location-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .location-btn {
    flex: 1;
    min-width: 120px;
  }
}

.manual-location {
  margin-top: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &-title {
    font-weight: 600;
    color: #fff;
    font-size: 0.9rem;
  }

  &-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 12px;
  }

  &-hint {
    margin-top: 8px;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.text-negative {
  color: #f87171 !important;
}

.text-success {
  color: #34d399 !important;
}

.text-warning {
  color: #f59e0b !important;
}

.text-grey-6 {
  color: #9ca3af !important;
}

// ===== DISPONIBILIDADE =====
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

.error-message {
  font-size: 0.75rem;
  color: #f56565;
  margin-top: 4px;
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
</style>
