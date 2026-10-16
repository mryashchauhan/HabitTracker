import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error('💥 ErrorBoundary caught:', error, errorInfo);
  }

  reset = () => this.setState({ hasError: false, error: null, errorInfo: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, errorInfo } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>💥</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>{error?.message ?? 'Unknown error'}</Text>

          <ScrollView style={styles.stackBox} nestedScrollEnabled>
            <Text style={styles.stack}>
              {error?.stack ?? ''}
              {'\n\nComponent Stack:\n'}
              {errorInfo?.componentStack ?? ''}
            </Text>
          </ScrollView>

          <Pressable
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}
            onPress={this.reset}
          >
            <Text style={styles.btnText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1C1C20',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emoji: { fontSize: 40, textAlign: 'center', marginBottom: 12 },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#E63946',
    fontSize: 13,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 16,
  },
  stackBox: {
    backgroundColor: '#111113',
    borderRadius: 10,
    padding: 12,
    maxHeight: 220,
    marginBottom: 20,
  },
  stack: {
    color: '#9F9FA1',
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 15,
  },
  btn: {
    backgroundColor: '#F6955D',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
