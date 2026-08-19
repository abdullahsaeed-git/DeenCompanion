// src/app/book-reader.tsx
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator } from 'react-native';

export default function BookReaderScreen() {
  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: 'https://archive.org/stream/{TafseerIbnKathirenglish114SurahsComplete}?ui=embed' }}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator style={{ position: 'absolute', top: '50%', left: '50%' }} />
        )}
      />
    </View>
  );
}