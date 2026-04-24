import React, { useState } from 'react';
import { StyleSheet, View, Text, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Placeholder components - replace with actual implementations
const CircularCarousel = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.carousel}>{children}</View>
);

const GestureDetector = ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
);

const AIAssistantBar = () => (
    <View style={styles.assistantBar}>
        <Text style={styles.assistantText}>Sallie AI Assistant</Text>
    </View>
);

const AppDrawer = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
    if (!visible) return null;
    return (
        <View style={styles.drawer}>
            <Text style={styles.drawerText}>App Drawer</Text>
        </View>
    );
};

export default function Index() {
    const [activeContext, setActiveContext] = useState('work');
    const [showAppDrawer, setShowAppDrawer] = useState(false);
    const [showCarousel, setShowCarousel] = useState(false);

    const carouselTabs = [
        {
            id: 'work',
            name: 'Work',
            shortName: 'Work',
            color: '#3B82F6',
            notifications: 3,
            timeRelevant: true
        },
        {
            id: 'mom',
            name: 'Mom',
            shortName: 'Mom',
            color: '#EC4899',
            notifications: 1
        },
        {
            id: 'personal',
            name: 'Personal',
            shortName: 'Me',
            color: '#10B981'
        },
        {
            id: 'social',
            name: 'Social',
            shortName: 'Social',
            color: '#8B5CF6',
            notifications: 8,
            urgent: true
        },
        {
            id: 'health',
            name: 'Health & Fitness',
            shortName: 'Health',
            color: '#F97316'
        },
        {
            id: 'finance',
            name: 'Finance',
            shortName: 'Money',
            color: '#EAB308'
        },
        {
            id: 'learning',
            name: 'Learning',
            shortName: 'Learn',
            color: '#06B6D4'
        }
    ];

    return (
        <SafeAreaProvider>
            <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
            <SafeAreaView style={styles.container}>
                <GestureDetector>
                    <View style={styles.content}>
                        <Text style={styles.title}>Sallie AI Assistant</Text>
                        <Text style={styles.subtitle}>Your intelligent companion</Text>

                        {showCarousel && (
                            <CircularCarousel>
                                {carouselTabs.map((tab) => (
                                    <View
                                        key={tab.id}
                                        style={[
                                            styles.tabItem,
                                            { backgroundColor: tab.color },
                                            activeContext === tab.id && styles.activeTab
                                        ]}
                                    >
                                        <Text style={styles.tabText}>{tab.shortName}</Text>
                                        {tab.notifications && (
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>{tab.notifications}</Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </CircularCarousel>
                        )}

                        <AIAssistantBar />
                    </View>
                </GestureDetector>

                <AppDrawer
                    visible={showAppDrawer}
                    onClose={() => setShowAppDrawer(false)}
                />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F2937',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#9CA3AF',
        marginBottom: 40,
        textAlign: 'center',
    },
    carousel: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    tabItem: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        position: 'relative',
    },
    activeTab: {
        transform: [{ scale: 1.2 }],
    },
    tabText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    assistantBar: {
        backgroundColor: '#374151',
        borderRadius: 25,
        paddingVertical: 15,
        paddingHorizontal: 25,
        width: '100%',
    },
    assistantText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
    },
    drawer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    drawerText: {
        color: '#FFFFFF',
        fontSize: 18,
    },
});