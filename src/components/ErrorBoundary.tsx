import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../theme';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack?: string } | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={80} color={Colors.error.main} />
            </View>

            {/* Error Title */}
            <Text style={styles.title}>Oops! Something Went Wrong</Text>

            {/* Error Message */}
            <Text style={styles.message}>
              An unexpected error occurred. Our team has been notified.
            </Text>

            {/* Error Details (Development only) */}
            {__DEV__ && this.state.error && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Error Details:</Text>
                <Text style={styles.errorText} selectable>
                  {this.state.error.toString()}
                </Text>

                {this.state.errorInfo?.componentStack && (
                  <>
                    <Text style={[styles.detailsTitle, { marginTop: Spacing[3] }]}>
                      Component Stack:
                    </Text>
                    <Text style={styles.stackText} selectable>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  </>
                )}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={this.handleReset}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color="#FFF" />
                <Text style={styles.resetButtonText}>Try Again</Text>
              </TouchableOpacity>

              {!__DEV__ && (
                <TouchableOpacity
                  style={styles.supportButton}
                  onPress={() => {
                    // TODO: Implement contact support
                    console.log('Contact support');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="help-circle" size={20} color={Colors.primary[600]} />
                  <Text style={styles.supportButtonText}>Contact Support</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Helpful Tips */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>What You Can Try:</Text>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success.main} />
                <Text style={styles.tipText}>Refresh the page</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success.main} />
                <Text style={styles.tipText}>Close and reopen the app</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success.main} />
                <Text style={styles.tipText}>Check your internet connection</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[6],
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  message: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSize.sm * 1.6,
    marginBottom: Spacing[6],
  },
  detailsContainer: {
    backgroundColor: Colors.error.light,
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    marginBottom: Spacing[6],
    borderLeftWidth: 4,
    borderLeftColor: Colors.error.main,
  },
  detailsTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.error.main,
    marginBottom: Spacing[2],
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error.main,
    fontFamily: 'monospace',
    lineHeight: FontSize.xs * 1.5,
  },
  stackText: {
    fontSize: FontSize.xs,
    color: Colors.error.main,
    fontFamily: 'monospace',
    lineHeight: FontSize.xs * 1.4,
  },
  actionContainer: {
    gap: Spacing[2],
    marginBottom: Spacing[6],
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing[2],
  },
  resetButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: '#FFF',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary[100],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  supportButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary[600],
  },
  tipsContainer: {
    backgroundColor: Colors.info.light,
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    gap: Spacing[2],
  },
  tipsTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.info.main,
    marginBottom: Spacing[2],
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  tipText: {
    fontSize: FontSize.xs,
    color: Colors.info.main,
    flex: 1,
  },
});
