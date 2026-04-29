import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock } from 'lucide-react';

// Emoji categories with their emojis
const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
      '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    ],
  },
  {
    id: 'people',
    name: 'People',
    icon: '👋',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
      '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎',
      '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
      '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠',
      '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸',
    ],
  },
  {
    id: 'animals',
    name: 'Animals',
    icon: '🐶',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
      '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
      '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
      '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎',
    ],
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍎',
    emojis: [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒',
      '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬',
      '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠',
      '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞',
      '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕',
    ],
  },
  {
    id: 'activities',
    name: 'Activities',
    icon: '⚽',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
      '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳',
      '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️',
      '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '🤾',
      '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵',
    ],
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: '🚗',
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
      '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼',
      '🚁', '🛩️', '✈️', '🪂', '🚀', '🛸', '🚢', '⛵', '🪝', '⚓',
      '🪝', '⛽', '🚧', '🚨', '🚥', '🚦', '🛑', '🚏', '🗺️', '🗿',
      '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️',
    ],
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: '💻',
    emojis: [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
      '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '📼',
      '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️',
      '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡',
      '🔋', '🔌', '💡', '🕯️', '🪔', '🔦', '🏮', '🪔', '📔', '📕',
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '❤️‍🔥', '❤️‍🩹',
      '🧡‍🔥', '💛‍🔥', '💚‍🔥', '💙‍🔥', '💜‍🔥', '🤍‍🔥', '🖤‍🔥', '💔‍🔥', '❤️‍💔', '🧡‍💔',
      '💛‍💔', '💚‍💔', '💙‍💔', '💜‍💔', '🤍‍💔', '🖤‍💔', '💯', '💢', '💥', '💫',
      '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤',
    ],
  },
  {
    id: 'flags',
    name: 'Flags',
    icon: '🏳️',
    emojis: [
      '🏳️', '🏴', '🏴‍☠️', '🏁', '🚩', '🪧', '🏳️‍🌈', '🏳️‍⚧️', '🇺🇳', '🇺🇸',
      '🇦🇫', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷',
      '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾',
      '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇮🇴',
      '🇻🇬', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇨🇻', '🇰🇾',
    ],
  },
];

// Recent emojis storage key
const RECENT_EMOJIS_KEY = 'sallie_recent_emojis';

interface EmojiPickerProps {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  visible,
  onSelect,
  onClose,
  theme = 'dark',
}) => {
  const [selectedCategory, setSelectedCategory] = useState('smileys');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load recent emojis on mount
  useEffect(() => {
    loadRecentEmojis();
  }, []);

  // Load recent emojis from localStorage
  const loadRecentEmojis = () => {
    try {
      const stored = localStorage.getItem(RECENT_EMOJIS_KEY);
      if (stored) {
        setRecentEmojis(JSON.parse(stored));
      } else {
        // Default recent emojis
        setRecentEmojis(['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '🎯']);
      }
    } catch (error) {
      console.error('Failed to load recent emojis:', error);
      setRecentEmojis(['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '🎯']);
    }
  };

  // Save emoji to recent
  const saveToRecent = useCallback((emoji: string) => {
    try {
      const updated = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 20);
      setRecentEmojis(updated);
      localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent emoji:', error);
    }
  }, [recentEmojis]);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: string) => {
    saveToRecent(emoji);
    onSelect(emoji);
    onClose();
  }, [onSelect, onClose, saveToRecent]);

  // Filter emojis based on search
  const filteredEmojis = useMemo(() => {
    if (!searchQuery) return [];
    
    const allEmojis = EMOJI_CATEGORIES.flatMap(cat => cat.emojis);
    return allEmojis.filter(emoji => 
      emoji.includes(searchQuery) || 
      emoji.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Get current category emojis
  const currentEmojis = useMemo(() => {
    if (searchQuery) return filteredEmojis;
    
    const category = EMOJI_CATEGORIES.find(cat => cat.id === selectedCategory);
    return category ? category.emojis : [];
  }, [selectedCategory, searchQuery, filteredEmojis]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className={`w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <h2 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Emoji Picker
            </h2>
            <button
              onClick={onClose}
              title="Close emoji picker"
              aria-label="Close emoji picker"
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-800 text-gray-400' 
                  : 'hover:bg-gray-200 text-gray-400'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className={`p-4 border-b ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <div className={`relative flex items-center px-3 py-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Search className={`w-4 h-4 mr-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search emojis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Recent Emojis */}
          {recentEmojis.length > 0 && !searchQuery && (
            <div className={`p-4 border-b ${
              theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className="flex items-center mb-3">
                <Clock className={`w-4 h-4 mr-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Recently Used
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {recentEmojis.slice(0, 12).map((emoji, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => handleEmojiSelect(emoji)}
                    className={`p-2 text-lg rounded-lg transition-all hover:scale-110 ${
                      theme === 'dark' 
                        ? 'hover:bg-gray-800' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          {!searchQuery && (
            <div className={`flex overflow-x-auto p-4 border-b ${
              theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className="flex gap-2">
                {EMOJI_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      selectedCategory === category.id
                        ? theme === 'dark'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-500 text-white'
                        : theme === 'dark'
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Emojis Grid */}
          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            <div className="p-4">
              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1">
                {currentEmojis.map((emoji, index) => (
                  <button
                    key={`${selectedCategory}-${index}`}
                    onClick={() => handleEmojiSelect(emoji)}
                    className={`p-2 text-lg rounded-lg transition-all hover:scale-110 ${
                      theme === 'dark' 
                        ? 'hover:bg-gray-800' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              
              {currentEmojis.length === 0 && (
                <div className="text-center py-8">
                  <p className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No emojis found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <p className={`text-center text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {currentEmojis.length} emojis
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmojiPicker;
