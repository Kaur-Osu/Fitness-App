import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Index() {
  const [pasos, setPasos] = useState(0);
  const [distancia, setDistancia] = useState(0);
  const [intensidad, setIntensidad] = useState('Detenido');
  const [activo, setActivo] = useState(false);

  const pasosRef = useRef(0);
  const ultimoPaso = useRef(0);

  useEffect(() => {
    if (!activo) {
      setIntensidad('Detenido');
      return;
    }

    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      // Calculamos la intensidad del movimiento
      const magnitud = Math.sqrt(
        x * x +
        y * y +
        z * z
      );

      // Eliminamos aproximadamente el efecto de la gravedad
      const movimiento = Math.abs(magnitud - 1);

      const ahora = Date.now();

      // DETECCIÓN DE PASOS
      if (
        movimiento > 0.18 &&
        ahora - ultimoPaso.current > 350
      ) {
        ultimoPaso.current = ahora;

        pasosRef.current += 1;

        setPasos(pasosRef.current);

        // Distancia aproximada
        // 1 paso = 0.75 metros
        const metros = pasosRef.current * 0.75;

        setDistancia(metros / 1000);
      }

      // DETECCIÓN DE INTENSIDAD
      if (movimiento < 0.08) {
        setIntensidad('Detenido');
      } else if (movimiento < 0.30) {
        setIntensidad('Caminando');
      } else {
        setIntensidad('Corriendo');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [activo]);

  // Reiniciar todos los datos
  const reiniciar = () => {
    pasosRef.current = 0;
    ultimoPaso.current = 0;

    setPasos(0);
    setDistancia(0);
    setIntensidad('Detenido');
  };

  return (
    <View style={styles.container}>

      {/* TÍTULO */}
      <Text style={styles.titulo}>
        Fitness
      </Text>

      <Text style={styles.subtitulo}>
        Seguimiento de actividad
      </Text>

      {/* PASOS */}
      <View style={styles.tarjetaPasos}>
        <Text style={styles.numeroPasos}>
          {pasos}
        </Text>

        <Text style={styles.textoPasos}>
          PASOS
        </Text>
      </View>

      {/* DISTANCIA E INTENSIDAD */}
      <View style={styles.fila}>

        <View style={styles.tarjeta}>
          <Text style={styles.valor}>
            {distancia.toFixed(2)}
          </Text>

          <Text style={styles.etiqueta}>
            KILÓMETROS
          </Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.valor}>
            {intensidad}
          </Text>

          <Text style={styles.etiqueta}>
            INTENSIDAD
          </Text>
        </View>

      </View>

      {/* BOTÓN INICIAR / DETENER */}
      <TouchableOpacity
        style={[
          styles.boton,
          activo
            ? styles.botonDetener
            : styles.botonIniciar,
        ]}
        onPress={() => setActivo(!activo)}
      >
        <Text style={styles.textoBoton}>
          {activo ? 'Detener' : 'Iniciar'}
        </Text>
      </TouchableOpacity>

      {/* BOTÓN REINICIAR */}
      <TouchableOpacity
        style={styles.botonReiniciar}
        onPress={reiniciar}
      >
        <Text style={styles.textoReiniciar}>
          Reiniciar
        </Text>
      </TouchableOpacity>

      {/* INFORMACIÓN */}
      <Text style={styles.info}>
        La distancia es aproximada y se calcula
        usando 0.75 metros por paso.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 25,
    paddingTop: 70,
  },

  titulo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111',
  },

  subtitulo: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },

  tarjetaPasos: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,

    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  numeroPasos: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#111',
  },

  textoPasos: {
    fontSize: 14,
    color: '#777',
    fontWeight: 'bold',
  },

  fila: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },

  tarjeta: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',

    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  valor: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },

  etiqueta: {
    fontSize: 12,
    color: '#777',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  boton: {
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginBottom: 15,
  },

  botonIniciar: {
    backgroundColor: '#111',
  },

  botonDetener: {
    backgroundColor: '#555',
  },

  textoBoton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  botonReiniciar: {
    padding: 15,
    alignItems: 'center',
  },

  textoReiniciar: {
    fontSize: 16,
    color: '#555',
  },

  info: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginTop: 15,
  },

});