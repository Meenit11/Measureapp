import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import ARMeasurement from './ar';

export default function App() {
  const [distance, setDistance] = useState(null);

  const handleMeasure = async () => {
    const measuredDistance = await ARMeasurement.measure();
    setDistance(measuredDistance);
  };

  return (
    <View style={styles.container}>
      <Button title="Measure Object" onPress={handleMeasure} />
      {distance && <Text>Measured Distance: {distance} cm</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
