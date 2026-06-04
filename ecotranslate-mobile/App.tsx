// App.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';

// Mapeamento de Bandeiras
const getFlagEmoji = (language: string) => {
  if (!language) return '🏳️';
  const lower = language.toLowerCase();
  if (lower.includes('inglês') || lower.includes('english')) return '🇺🇸';
  if (lower.includes('português') || lower.includes('portuguese')) return '🇧🇷';
  if (lower.includes('espanhol') || lower.includes('spanish')) return '🇪🇸';
  if (lower.includes('japonês') || lower.includes('japanese')) return '🇯🇵';
  if (lower.includes('francês') || lower.includes('french')) return '🇫🇷';
  if (lower.includes('alemão') || lower.includes('german')) return '🇩🇪';
  if (lower.includes('italiano') || lower.includes('italian')) return '🇮🇹';
  return '🏳️';
};

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();

  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('Inicializando câmera...');
  const [translationResult, setTranslationResult] = useState<any>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);

  const cameraRef = useRef<CameraView | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadingRef = useRef(false);

  // Verifique seu IP local caso a rede Wi-Fi mude
  const backendUrl = 'http://192.168.100.12:3000/api/translate';

  const clearResult = useCallback(() => {
    setTranslationResult(null);
  }, []);

  const clearScanInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopScanning = useCallback(() => {
    clearScanInterval();
    loadingRef.current = false;
    setIsScanning(false);
    setLoading(false);
    setStatusText(cameraReady ? 'Câmera pronta.' : 'Inicializando câmera...');
  }, [clearScanInterval, cameraReady]);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
    return () => clearScanInterval();
  }, [permission?.granted, requestPermission, clearScanInterval]);

  const restartCamera = useCallback(() => {
    clearScanInterval();
    loadingRef.current = false;
    setIsScanning(false);
    setLoading(false);
    setCameraReady(false);
    setTranslationResult(null);
    setStatusText('Reinicializando câmera...');
    setCameraKey((prev) => prev + 1);
  }, [clearScanInterval]);

  const sendToBackend = useCallback(async (base64Image: string) => {
    setStatusText('Gemini analisando imagem...');
    try {
      const response = await axios.post(
        backendUrl,
        { text: base64Image, targetLanguage: 'Português' },
        { timeout: 30000 }
      );
      if (response.data) {
        setTranslationResult(response.data);
      }
    } catch (error) {
      console.error('Erro no Axios:', error);
      setStatusText('Erro de conexão com o servidor.');
    }
  }, []);

  const captureFrame = useCallback(async () => {
    if (!cameraRef.current || !cameraReady || loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);
      setStatusText('Capturando...');

      // Captura leve e rápida no Realme
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.4,
        base64: true,
        skipProcessing: true,
      });

      if (!photo?.base64 || !photo?.uri) {
        setStatusText('Nenhuma imagem capturada.');
        return;
      }

      // Compressão extrema (Reduz payload e acelera Wi-Fi)
      const compressedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (compressedImage.base64) {
        await sendToBackend(compressedImage.base64);
        setStatusText('Tradução atualizada.');
      }
    } catch (error) {
      console.error('Erro na captura:', error);
      setStatusText('Erro ao capturar imagem.');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [cameraReady, sendToBackend]);

  const startScanning = useCallback(() => {
    if (!cameraReady) {
      setStatusText('Aguarde a câmera...');
      return;
    }
    setIsScanning(true);
    setTranslationResult(null);
    setStatusText('Scanner ativo. Mirando...');
    clearScanInterval();
    captureFrame();
    intervalRef.current = setInterval(() => captureFrame(), 5000);
  }, [cameraReady, captureFrame, clearScanInterval]);

  const toggleScanning = useCallback(() => {
    if (isScanning) stopScanning();
    else startScanning();
  }, [isScanning, startScanning, stopScanning]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>Precisamos da permissão da câmera!</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Liberar Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Câmera Responsiva (Sem altura fixa) */}
      <View style={styles.cameraContainer}>
        <CameraView
          key={cameraKey}
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          mode="picture"
          onCameraReady={() => {
            setCameraReady(true);
            setStatusText('Câmera pronta.');
          }}
          onMountError={(e: any) => {
            setCameraReady(false);
            setStatusText(`Erro nativo: ${e?.message}`);
          }}
        />
        <View pointerEvents="none" style={styles.overlayContainer}>
          <View style={styles.scanTargetBox} />
          <Text style={styles.overlayInstruction}>Posicione o texto no quadrado</Text>
        </View>
      </View>

      {/* Painel Inferior Premium */}
      <View style={styles.controlPanel}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonMain, isScanning ? styles.buttonStop : styles.buttonStart, !cameraReady && styles.buttonDisabled]}
            onPress={toggleScanning}
            disabled={!cameraReady}
          >
            <Text style={styles.buttonText}>
              {!cameraReady ? 'Inicializando...' : isScanning ? '⏹️ Parar' : '🚀 Traduzir Realtime'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={restartCamera}>
            <Text style={styles.buttonTextSecondary}>🔄 Reset Cam</Text>
          </TouchableOpacity>
        </View>

        {(loading || statusText !== '') && (
          <View style={styles.loaderInline}>
            {loading && <ActivityIndicator size="small" color="#007AFF" style={{ marginRight: 8 }} />}
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        )}

        {/* Cartão de Resultado com Botão Limpar e Bandeiras */}
        {translationResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.headerTitle}>
                {getFlagEmoji(translationResult.detectedLanguage || 'Auto')} {translationResult.detectedLanguage || 'Auto'} ➔ {getFlagEmoji('Português')} Português
              </Text>
              <TouchableOpacity onPress={clearResult} style={styles.clearButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.clearButtonText}>🗑️ Limpar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={true}>
              <Text style={styles.translatedText}>
                {translationResult.translatedText || 'Nenhuma tradução retornada.'}
              </Text>

              {translationResult.originalText && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.originalLabel}>📝 TEXTO ORIGINAL</Text>
                  <Text style={styles.originalText}>{translationResult.originalText}</Text>
                </>
              )}

              {translationResult.culturalNotes && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.notesLabel}>💡 OBSERVAÇÕES CULTURAIS</Text>
                  <Text style={styles.notesText}>{translationResult.culturalNotes}</Text>
                </>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  permissionText: { textAlign: 'center', marginBottom: 20, color: '#1C1C1E', fontSize: 16 },

  // Layout Flexível
cameraContainer: {
    flex: 1,
    flexGrow: 1,
    alignSelf: 'stretch',
    position: 'relative',
    backgroundColor: '#000',
    overflow: 'hidden'
  },
  camera: {
    flex: 1,
    flexGrow: 1,
    alignSelf: 'stretch',
    width: '100%',
    height: '100%'
  },

  overlayContainer: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'center', alignItems: 'center', zIndex: 2, elevation: 2 },
  scanTargetBox: { width: '85%', height: '50%', borderWidth: 2, borderColor: '#007AFF', borderRadius: 12 },
  overlayInstruction: { color: '#FFF', marginTop: 12, fontWeight: '600', textShadowColor: '#000', textShadowRadius: 2 },

  controlPanel: {
    flex: 1.2,
    backgroundColor: '#F9F9FB',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 20
  },

  buttonRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 12 },
  button: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  buttonMain: { width: '64%' },
  buttonSecondary: { width: '32%', backgroundColor: '#E5E5EA' },
  buttonStart: { backgroundColor: '#007AFF' },
  buttonStop: { backgroundColor: '#FF3B30' },
  buttonDisabled: { backgroundColor: '#8E8E93' },
  buttonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  buttonTextSecondary: { color: '#1C1C1E', fontSize: 14, fontWeight: '600' },

  loaderInline: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, height: 24 },
  statusText: { fontSize: 14, color: '#8E8E93', fontWeight: '500' },

  resultCard: { flex: 1, width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E5E5EA', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },

  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  headerTitle: { fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  clearButton: { backgroundColor: '#FF3B3015', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  clearButtonText: { fontSize: 12, color: '#FF3B30', fontWeight: '700' },

  translatedText: { fontSize: 24, fontWeight: '800', color: '#007AFF', lineHeight: 32, textAlign: 'center', marginVertical: 10 },

  divider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 16 },
  originalLabel: { fontSize: 11, fontWeight: '700', color: '#8E8E93', marginBottom: 6 },
  originalText: { fontSize: 14, color: '#555', fontStyle: 'italic', lineHeight: 22 },

  notesLabel: { fontSize: 11, fontWeight: '700', color: '#FF9500', marginBottom: 6 },
  notesText: { fontSize: 14, color: '#2C2C2E', lineHeight: 22 },

});