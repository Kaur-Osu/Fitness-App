import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

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

  const intensidadColor =
    intensidad === 'Corriendo'
      ? '#FF6B6B'
      : intensidad === 'Caminando'
      ? '#4ECDC4'
      : '#8E8E93';

  const intensidadIcono =
    intensidad === 'Corriendo'
      ? 'flash'
      : intensidad === 'Caminando'
      ? 'walk'
      : 'pause-circle';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F1A', '#1A1A2E']}
        style={StyleSheet.absoluteFill}
      />

      {/* TÍTULO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Fitness</Text>
          <Text style={styles.subtitulo}>Seguimiento de actividad</Text>
        </View>

        <View
          style={[
            styles.estadoBadge,
            { backgroundColor: activo ? '#4ECDC422' : '#8E8E9322' },
          ]}
        >
          <View
            style={[
              styles.estadoPunto,
              { backgroundColor: activo ? '#4ECDC4' : '#8E8E93' },
            ]}
          />
          <Text
            style={[
              styles.estadoTexto,
              { color: activo ? '#4ECDC4' : '#8E8E93' },
            ]}
          >
            {activo ? 'Activo' : 'Pausado'}
          </Text>
        </View>
      </View>

      {/* PASOS */}
      <LinearGradient
        colors={['#7B61FF', '#5B4FE0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tarjetaPasos}
      >
        <View style={styles.iconoCirculo}>
          <Ionicons name="footsteps" size={28} color="#fff" />
        </View>

        <Text style={styles.numeroPasos}>{pasos}</Text>

        <Text style={styles.textoPasos}>PASOS</Text>
      </LinearGradient>

      {/* DISTANCIA E INTENSIDAD */}
      <View style={styles.fila}>
        <View style={styles.tarjeta}>
          <View style={[styles.iconoChico, { backgroundColor: '#4ECDC422' }]}>
            <Ionicons name="map" size={20} color="#4ECDC4" />
          </View>

          <Text style={styles.valor}>{distancia.toFixed(2)}</Text>

          <Text style={styles.etiqueta}>KILÓMETROS</Text>
        </View>

        <View style={styles.tarjeta}>
          <View
            style={[styles.iconoChico, { backgroundColor: `${intensidadColor}22` }]}
          >
            <Ionicons name={intensidadIcono as any} size={20} color={intensidadColor} />
          </View>

          <Text style={[styles.valor, { color: intensidadColor }]}>
            {intensidad}
          </Text>

          <Text style={styles.etiqueta}>INTENSIDAD</Text>
        </View>
      </View>

      {/* BOTÓN INICIAR / DETENER */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setActivo(!activo)}
        style={styles.botonWrapper}
      >
        <LinearGradient
          colors={activo ? ['#FF6B6B', '#EE5253'] : ['#4ECDC4', '#3DBDB4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.boton}
        >
          <Ionicons
            name={activo ? 'stop-circle' : 'play-circle'}
            size={22}
            color="#fff"
          />
          <Text style={styles.textoBoton}>
            {activo ? 'Detener' : 'Iniciar'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* BOTÓN REINICIAR */}
      <TouchableOpacity style={styles.botonReiniciar} onPress={reiniciar}>
        <Ionicons name="refresh" size={16} color="#8E8E93" />
        <Text style={styles.textoReiniciar}>Reiniciar</Text>
      </TouchableOpacity>

      {/* INFORMACIÓN */}
      <Text style={styles.info}>
        La distancia es aproximada y se calcula usando 0.75 metros por paso.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    paddingHorizontal: width * 0.06,
    paddingTop: 70,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },

  titulo: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },

  subtitulo: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 2,
  },

  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    marginTop: 6,
  },

  estadoPunto: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  estadoTexto: {
    fontSize: 12,
    fontWeight: '700',
  },

  tarjetaPasos: {
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    marginBottom: 18,

    shadowColor: '#5B4FE0',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  iconoCirculo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  numeroPasos: {
    fontSize: 60,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },

  textoPasos: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 2,
  },

  fila: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 26,
  },

  tarjeta: {
    flex: 1,
    backgroundColor: '#1C1C2E',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A3D',
  },

  iconoChico: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  valor: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },

  etiqueta: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },

  botonWrapper: {
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  boton: {
    flexDirection: 'row',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  textoBoton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  botonReiniciar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
  },

  textoReiniciar: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '600',
  },

  info: {
    textAlign: 'center',
    color: '#5A5A6E',
    fontSize: 12,
    marginTop: 14,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
});
