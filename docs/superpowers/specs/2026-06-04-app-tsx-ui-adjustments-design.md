# App.tsx UI Adjustments (Control Panel)

## Overview

This document specifies the design changes to the React Native `App.tsx` file in the EcoTranslate mobile application. The goal is to make the translation result area scrollable and emphasize the translated text, while strictly adhering to structural constraints that prevent breaking the camera behavior on Android/Realme devices.

## Constraints

- **DO NOT** modify the `<CameraView>` component's structure, properties, or its wrapper `<View style={styles.cameraContainer}>`.
- **DO NOT** modify the `styles.camera` definition.
- **DO NOT** use `StyleSheet.absoluteFillObject` on the camera.
- The `overlayContainer` must remain absolute.
- All layout changes are restricted to the `controlPanel` and `resultCard` areas.

## Design Decisions (Option A)

### 1. Structural Fix for Scrolling

The current implementation of `ScrollView` lacks proper constraints to behave correctly within the flexible `resultCard`.

- We will add `style={{ flex: 1 }}` to the `<ScrollView>` to ensure it takes up the available space within the card and allows scrolling when content overflows.
- The `resultCard` itself will maintain `flex: 1` to fill the remaining space in the `controlPanel`.

### 2. Header Pinning

The result header (containing the language direction and the "Limpar" button) will remain outside the `<ScrollView>`. This ensures that users can always clear the result without having to scroll back to the top.

### 3. Visual Hierarchy

The translated text must be the primary focus, with the original text acting as secondary context.

- **Translated Text (`translatedText`):**
  - Increase font size slightly if necessary (e.g., to 24px or larger).
  - Use the primary vibrant color (`#007AFF`).
  - Ensure it has no line limits (`numberOfLines` should not be set).
  - Ensure it wraps correctly.
- **Original Text (`originalText`):**
  - Rendered below a visual divider.
  - Use a smaller font size (e.g., 14px).
  - Use a muted color (e.g., `#555` or `#8E8E93`).
  - Use an italic font style to distinguish it from the translation.
- **Cultural Notes (`notesText`):**
  - Rendered below another visual divider.
  - Styled distinctly but with lower visual weight than the translation.

## Target Structure (Pseudo-JSX)

```tsx
<View style={styles.controlPanel}>
  {/* Buttons and Loader unchanged */}

  {translationResult && (
    <View style={styles.resultCard}>
      {/* Pinned Header */}
      <View style={styles.resultHeader}>
         ...
      </View>

      {/* Scrollable Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={true}>
        <Text style={styles.translatedText}>...</Text>

        {translationResult.originalText && (
          <>
            <View style={styles.divider} />
            <Text style={styles.originalLabel}>...</Text>
            <Text style={styles.originalText}>...</Text>
          </>
        )}
        {/* Cultural Notes */}
      </ScrollView>
    </View>
  )}
</View>
```

## Review Checklist

- [x] Does the design respect all camera-related constraints? Yes.
- [x] Is the scroll view properly flexed? Yes.
- [x] Is the header pinned? Yes.
- [x] Is the translation visually emphasized? Yes.
