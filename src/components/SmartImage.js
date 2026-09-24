import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

function toProxy(uri) {
  if (!uri) return null;
  const stripped = String(uri).replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(stripped)}&n=-1`;
}

export default function SmartImage({
  uri,
  style,
  resizeMode = 'cover',
  icon = 'image-outline',
  label,
  showLoader = true,
}) {
  const { colors } = useTheme();
  const [stage, setStage] = useState(uri ? 0 : 2); // 0 asli, 1 proxy, 2 gagal
  const [loading, setLoading] = useState(!!uri);

  useEffect(() => {
    setStage(uri ? 0 : 2);
    setLoading(!!uri);
  }, [uri]);

  const source = stage === 0 ? uri : stage === 1 ? toProxy(uri) : null;

  if (!source) {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          },
        ]}
      >
        <Ionicons name={icon} size={24} color={colors.textFaint} />
        {label ? (
          <Text
            numberOfLines={2}
            style={{
              color: colors.textFaint,
              fontSize: 10,
              fontWeight: '700',
              textAlign: 'center',
              paddingHorizontal: 8,
            }}
          >
            {label}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[style, { backgroundColor: colors.surfaceAlt, overflow: 'hidden' }]}>
      <Image
        source={{ uri: source }}
        style={{ width: '100%', height: '100%' }}
        resizeMode={resizeMode}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setStage((prev) => (prev === 0 ? 1 : 2));
        }}
      />
      {loading && showLoader ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="small" color={colors.textFaint} />
        </View>
      ) : null}
    </View>
  );
}