import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface VideoSettingsProps {
  visible: boolean;
  onClose: () => void;
  quality: string;
  onQualityChange: (quality: string) => void;
  playbackSpeed: number;
  onPlaybackSpeedChange: (speed: number) => void;
  isSubtitleEnabled: boolean;
  onSubtitleToggle: () => void;
}

const QUALITY_OPTIONS = ['Auto', '1080p', '720p', '480p', '360p'];
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const VideoSettings: React.FC<VideoSettingsProps> = ({
  visible,
  onClose,
  quality,
  onQualityChange,
  playbackSpeed,
  onPlaybackSpeedChange,
  isSubtitleEnabled,
  onSubtitleToggle
}) => {
  const [activeTab, setActiveTab] = useState<'quality' | 'speed' | 'subtitle'>('quality');

  const renderQualitySettings = () => (
    <View style={styles.settingsContainer}>
      {QUALITY_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            quality === option && styles.selectedOption
          ]}
          onPress={() => onQualityChange(option)}
        >
          <Text style={[
            styles.optionText,
            quality === option && styles.selectedOptionText
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSpeedSettings = () => (
    <View style={styles.settingsContainer}>
      {SPEED_OPTIONS.map((speed) => (
        <TouchableOpacity
          key={speed}
          style={[
            styles.option,
            playbackSpeed === speed && styles.selectedOption
          ]}
          onPress={() => onPlaybackSpeedChange(speed)}
        >
          <Text style={[
            styles.optionText,
            playbackSpeed === speed && styles.selectedOptionText
          ]}>
            {speed}x
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSubtitleSettings = () => (
    <View style={styles.settingsContainer}>
      <TouchableOpacity
        style={styles.subtitleOption}
        onPress={onSubtitleToggle}
      >
        <Text style={styles.optionText}>Sous-titres</Text>
        <MaterialCommunityIcons
          name={isSubtitleEnabled ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Paramètres</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'quality' && styles.activeTab]}
              onPress={() => setActiveTab('quality')}
            >
              <MaterialCommunityIcons name="quality-high" size={20} color="#fff" />
              <Text style={styles.tabText}>Qualité</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'speed' && styles.activeTab]}
              onPress={() => setActiveTab('speed')}
            >
              <MaterialCommunityIcons name="play-speed" size={20} color="#fff" />
              <Text style={styles.tabText}>Vitesse</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'subtitle' && styles.activeTab]}
              onPress={() => setActiveTab('subtitle')}
            >
              <MaterialCommunityIcons name="subtitles" size={20} color="#fff" />
              <Text style={styles.tabText}>Sous-titres</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {activeTab === 'quality' && renderQualitySettings()}
            {activeTab === 'speed' && renderSpeedSettings()}
            {activeTab === 'subtitle' && renderSubtitleSettings()}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#06D001',
  },
  tabText: {
    color: '#fff',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  settingsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
  },
  selectedOption: {
    backgroundColor: '#06D001',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  subtitleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
  },
}); 