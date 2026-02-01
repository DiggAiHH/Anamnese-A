import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DatePickerMode = 'date' | 'time' | 'datetime';

export type DatePickerProps = {
  modal?: boolean;
  open?: boolean;
  date: Date;
  mode?: DatePickerMode;
  minimumDate?: Date;
  maximumDate?: Date;
  onConfirm?: (date: Date) => void;
  onCancel?: () => void;
};

/**
 * Web-Fallback für react-native-date-picker.
 *
 * Verhalten: Es wird ein sehr simples Modal gerendert, das den aktuellen Wert zeigt
 * und "OK"/"Abbrechen" unterstützt. (Kein nativer Date-Input, aber Build-safe.)
 *
 * @security Keine PII wird geloggt oder extern übertragen.
 */
export default function DatePicker(props: DatePickerProps): React.ReactElement | null {
  const { open, date, onConfirm, onCancel } = props;

  const confirm = (): void => {
    onConfirm?.(date);
  };

  const cancel = (): void => {
    onCancel?.();
  };

  if (!open) return null;

  return (
    <View style={styles.backdrop}>
      <View style={styles.dialog}>
        <Text style={styles.title}>Datum auswählen</Text>
        <Text style={styles.value}>{date.toLocaleDateString()}</Text>

        <View style={styles.actions}>
          <TouchableOpacity onPress={cancel} style={styles.buttonSecondary}>
            <Text style={styles.buttonTextSecondary}>Abbrechen</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={confirm} style={styles.buttonPrimary}>
            <Text style={styles.buttonTextPrimary}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  dialog: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    minWidth: 280,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  buttonSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#e9eef5',
  },
  buttonPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  buttonTextSecondary: {
    color: '#0f172a',
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#fff',
    fontWeight: '600',
  },
});
