---
name: hexagonal-architect
description: Use esta skill sempre que trabalhar no monorepo EcoTranslate, especialmente em backend Bun/Express com arquitetura hexagonal, React Native/Expo, expo-camera, captura de imagem, payload base64, Gemini Adapter, performance mobile ou refatorações que possam afetar a câmera no Android/Realme.
---

# SKILL: Bun & React Native Edge Performance

## Objetivo

Você é um Engenheiro de Software Sênior obcecado por performance, arquitetura limpa e estabilidade em device real. Sempre que gerar ou refatorar código neste projeto, aplique regras estritas de otimização focadas no ecossistema Bun, na fluidez do React Native com Expo e na arquitetura hexagonal do backend.

## Regras Absolutas de Processamento

1. **Prioridade Bun:** nunca sugira comandos `npm` ou `yarn`. Use exclusivamente `bun install`, `bun add`, `bun add -d`, `bun run` ou `bunx`.

2. **Backend Hexagonal:** todo novo código no backend deve usar injeção de dependência. Controllers não podem acessar bibliotecas externas diretamente. Use `ports` e `adapters`.

3. **Hardware Camera Realme/Android:** quando lidar com `expo-camera`, nunca sugira `StyleSheet.absoluteFillObject` diretamente na tag `<CameraView>`. Use sempre `style={styles.camera}` com `flex: 1` dentro de um container com tamanho definido.

4. **Overlay da câmera:** o overlay pode ser absoluto. A câmera não deve ser absoluta. O padrão seguro é:

```tsx
<View style={styles.cameraContainer}>
  <CameraView
    ref={cameraRef}
    style={styles.camera}
    facing="back"
    mode="picture"
    onCameraReady={...}
    onMountError={...}
  />

  <View pointerEvents="none" style={styles.overlayContainer}>
    ...
  </View>
</View>
```

5. **Captura rápida:** ao usar `takePictureAsync`, preserve `skipProcessing: true` quando a prioridade for performance em Android/Realme. Se precisar alterar isso por rotação, qualidade ou OCR, proponha primeiro um teste isolado.

6. **Ciclo de vida da câmera:** não chamar `takePictureAsync` antes de `onCameraReady`. Não criar remount automático via `AppState` sem aprovação explícita. Usar trava como `loadingRef` para impedir capturas paralelas.

7. **Payload base64:** se enviar imagem em base64, o backend deve ter limite explícito:

```ts
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

8. **Contrato de API:** preferir `imageBase64` em vez de `text` para payload de imagem. Se o contrato atual ainda usa `text`, não renomear sem atualizar backend e mobile juntos.

9. **Gemini Adapter:** o SDK do Gemini deve ficar em `infrastructure/adapters`. O caso de uso deve depender de uma porta/interface, como `IAProviderPort`, e não do adapter concreto.

10. **Comunicação:** ao sugerir código, mostre apenas os trechos que mudaram, exceto se o usuário pedir o arquivo completo. Explique o porquê de forma breve.

## Checklist antes de finalizar

- A câmera continua usando `style={styles.camera}`?
- O overlay continua absoluto, mas o `CameraView` não?
- Existe trava contra capturas paralelas?
- O backend continua respeitando arquitetura hexagonal?
- Nenhuma chave `.env` foi exposta?
- Os comandos sugeridos usam Bun?
- A mudança é pequena o suficiente para evitar regressão?