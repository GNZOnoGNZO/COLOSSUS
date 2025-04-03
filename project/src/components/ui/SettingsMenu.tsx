import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Volume1, VolumeX, Monitor, Smartphone, X, Gamepad } from 'lucide-react';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    soundVolume: number;
    musicVolume: number;
    graphicsQuality: 'low' | 'medium' | 'high';
    controlScheme: 'touch' | 'buttons';
  };
  onUpdateSettings: (settings: Partial<SettingsMenuProps['settings']>) => void;
}

export function SettingsMenu({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: SettingsMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-medieval-dark rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-medieval text-medieval-accent">Settings</h2>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-medieval-light/10 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6 text-medieval-light" />
              </motion.button>
            </div>

            <div className="space-y-6">
              {/* Sound Volume */}
              <div>
                <label className="flex items-center gap-2 text-medieval-light mb-2">
                  <Volume2 className="w-5 h-5" />
                  Sound Effects
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.soundVolume}
                    onChange={(e) => onUpdateSettings({ soundVolume: Number(e.target.value) })}
                    className="flex-1 h-2 bg-medieval-light/20 rounded-full appearance-none
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                      [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                      [&::-webkit-slider-thumb]:bg-medieval-accent"
                  />
                  <span className="text-medieval-light w-8">{settings.soundVolume}%</span>
                </div>
              </div>

              {/* Music Volume */}
              <div>
                <label className="flex items-center gap-2 text-medieval-light mb-2">
                  <Volume1 className="w-5 h-5" />
                  Music
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.musicVolume}
                    onChange={(e) => onUpdateSettings({ musicVolume: Number(e.target.value) })}
                    className="flex-1 h-2 bg-medieval-light/20 rounded-full appearance-none
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                      [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                      [&::-webkit-slider-thumb]:bg-medieval-accent"
                  />
                  <span className="text-medieval-light w-8">{settings.musicVolume}%</span>
                </div>
              </div>

              {/* Graphics Quality */}
              <div>
                <label className="flex items-center gap-2 text-medieval-light mb-2">
                  <Monitor className="w-5 h-5" />
                  Graphics Quality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((quality) => (
                    <motion.button
                      key={quality}
                      onClick={() => onUpdateSettings({ graphicsQuality: quality as any })}
                      className={`p-2 rounded-lg capitalize ${
                        settings.graphicsQuality === quality
                          ? 'bg-medieval-accent text-medieval-dark'
                          : 'bg-medieval-light/10 text-medieval-light'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {quality}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Control Scheme */}
              <div>
                <label className="flex items-center gap-2 text-medieval-light mb-2">
                  <Gamepad className="w-5 h-5" />
                  Controls
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    onClick={() => onUpdateSettings({ controlScheme: 'touch' })}
                    className={`p-3 rounded-lg flex items-center justify-center gap-2 ${
                      settings.controlScheme === 'touch'
                        ? 'bg-medieval-accent text-medieval-dark'
                        : 'bg-medieval-light/10 text-medieval-light'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Smartphone className="w-5 h-5" />
                    Touch
                  </motion.button>
                  <motion.button
                    onClick={() => onUpdateSettings({ controlScheme: 'buttons' })}
                    className={`p-3 rounded-lg flex items-center justify-center gap-2 ${
                      settings.controlScheme === 'buttons'
                        ? 'bg-medieval-accent text-medieval-dark'
                        : 'bg-medieval-light/10 text-medieval-light'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Gamepad className="w-5 h-5" />
                    Buttons
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}