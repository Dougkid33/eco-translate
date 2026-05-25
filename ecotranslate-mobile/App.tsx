// App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Tesseract from 'tesseract.js';
import axios from 'axios';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [translationResult, setTranslationResult] = useState<any>(null);
  
  const cameraRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  // Solicita permissão da câmera assim que o app abre
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
    return () => stopScanning(); // Limpa o intervalo se o app fechar
  }, [permission]);

  // Liga/Desliga o Scanner em tempo real
  const toggleScanning = () => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setTranslationResult(null);
    setStatusText('Scanner ativo. Mirando no texto...');
    
    // Loop: Tira um snapshot a cada 3 segundos para processar o OCR
    intervalRef.current = setInterval(() => {
      captureFrame();
    }, 3000);
  };

  const stopScanning = () => {
    setIsScanning(false);
    setLoading(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Captura o frame atual da tela da câmera de forma silenciosa
  const captureFrame = async () => {
    if (cameraRef.current && !loading) {
      try {
        setLoading(true);
        setStatusText('Capturando imagem...');
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5, // Qualidade menor para o OCR processar mais rápido
          skipProcessing: true, // Pula pós-processamentos pesados
        });

        if (photo?.uri) {
          processFrameOCR(photo.uri);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao capturar frame:", error);
        setLoading(false);
      }
    }
  };

  // Executa o OCR local no frame capturado
  const processFrameOCR = async (uri: string) => {
    setStatusText('Processando OCR local...');
    try {
      const { data: { text } } = await Tesseract.recognize(uri, 'eng');
      
      if (!text || text.trim().length < 4) {
        // Se o texto for muito curto ou ilegível, ignora esse frame e espera o próximo
        setLoading(false);
        setStatusText('Mirando... Alinhe o texto na tela.');
        return;
      }

      setStatusText('Texto encontrado! Traduzindo com Gemini...');
      sendToBackend(text);
    } catch (error) {
      console.error("Erro no OCR:", error);
      setLoading(false);
    }
  };

  // Dispara a string capturada para o seu backend hexagonal
  const sendToBackend = async (extractedText: string) => {
    try {
      // LEMBRE-SE: Mude para o IP da sua máquina se rodar no celular físico!
      const backendUrl = 'http://10.0.2.2:3000/api/translate'; 

      const response = await axios.post(backendUrl, {
        text: extractedText,
        targetLanguage: 'Português'
      });

      setTranslationResult(response.data);
    } catch (error) {
      console.error("Erro no backend:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>Precisamos da sua permissão para usar a câmera!</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Liberar Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Componente nativo de Câmera do Expo */}
      <CameraView style={styles.camera} ref={cameraRef}>
        <View style={styles.overlayContainer}>
          <View style={styles.scanTargetBox} />
          <Text style={styles.overlayInstruction}>Posicione o texto em inglês dentro do quadrado</Text>
        </View>
      </CameraView>

      {/* Painel de Controle Inferior */}
      <View style={styles.controlPanel}>
        <TouchableOpacity 
          style={[styles.button, isScanning ? styles.buttonStop : styles.buttonStart]} 
          onPress={toggleScanning}
        >
          <Text style={styles.buttonText}>
            {isScanning ? '⏹️ Parar Tradutor' : '🚀 Traduzir em Tempo Real'}
          </Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loaderInline}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.statusText}> {statusText}</Text>
          </View>
        )}

        {translationResult && (
          <View style={styles.resultCard}>
            <Text style={styles.label}>📝 TRADUÇÃO RETORNADA:</Text>
            <Text style={styles.translatedText}>{translationResult.translatedText}</Text>
            
            {translationResult.culturalNotes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>💡 {translationResult.culturalNotes}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  camera: { 
    flex: 0.6 
  }, 
  overlayContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scanTargetBox: { 
    width: '80%', 
    height: '40%', 
    borderWidth: 2, 
    borderColor: '#007AFF', 
    borderRadius: 12, 
    backgroundColor: 'transparent' 
  },
  overlayInstruction: { 
    color: '#FFF', 
    marginTop: 15, 
    fontWeight: '600', 
    textShadowColor: '#000', 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 3 
  },
  controlPanel: { 
    flex: 0.4, 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 20, 
    alignItems: 'center' 
  },
  button: { 
    paddingVertical: 15, 
    borderRadius: 12, 
    width: '100%', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  buttonStart: { 
    backgroundColor: '#007AFF' 
  },
  buttonStop: { 
    backgroundColor: '#FF3B30' 
  },
  buttonText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  loaderInline: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  statusText: { 
    fontSize: 13, 
    color: '#8E8E93' 
  },
  resultCard: { 
    width: '100%', 
    backgroundColor: '#F2F2F7', 
    borderRadius: 12, 
    padding: 15, 
    flex: 1 
  },
  label: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: '#007AFF', 
    marginBottom: 4 
  },
  translatedText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1C1C1E' 
  },
  notesContainer: { 
    marginTop: 8, 
    backgroundColor: '#FFF9E6', 
    padding: 8, 
    borderRadius: 6, 
    borderLeftWidth: 3, 
    borderLeftColor: '#FFCC00' 
  },
  notesText: { 
    fontSize: 13, 
    color: '#2C2C2E' 
  }
});