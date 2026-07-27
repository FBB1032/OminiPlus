import React, { useState, useMemo } from 'react';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useDoctorPatients } from '../../hooks/useDoctor';
import { Avatar, SkeletonList, EmptyState, ErrorState, Input } from '../../components';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';

export default function PatientListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: patientData, isLoading: _isLoading, isError, refetch } = useDoctorPatients();
  const showSkeleton = useSkeletonDelay(_isLoading, 150);

  // Local filtering based on debounced search query
  const filteredPatients = useMemo(() => {
    if (!patientData || !patientData.data) return [];
    
    return patientData.data.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const email = (patient.email || '').toLowerCase();
      const query = debouncedSearchQuery.toLowerCase();
      
      return fullName.includes(query) || email.includes(query);
    });
  }, [patientData, debouncedSearchQuery]);

  const renderPatientItem = React.useCallback(({ item }: { item: any }) => {
    const age = item.dateOfBirth
      ? new Date().getFullYear() - new Date(item.dateOfBirth).getFullYear()
      : null;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
        activeOpacity={0.7}
        style={styles.patientCard}
      >
        <Avatar
          name={`${item.firstName} ${item.lastName}`}
          uri={item.avatarUrl}
          size="md"
        />
        <View style={styles.infoContainer}>
          <Text style={styles.patientName}>
            {item.firstName} {item.lastName}
          </Text>
          <View style={styles.detailsRow}>
            {age !== null && (
              <Text style={styles.detailText}>
                {age} y/o
              </Text>
            )}
            {item.gender && (
              <>
                <View style={styles.dot} />
                <Text style={styles.detailText}>
                  {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
                </Text>
              </>
            )}
            {item.bloodType && (
              <>
                <View style={styles.dot} />
                <Text style={styles.detailText}>
                  Blood: {item.bloodType}
                </Text>
              </>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
      </TouchableOpacity>
    );
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Patients</Text>
      </View>

      {user?.isApproved === false && (
        <View style={styles.pendingBanner}>
          <Ionicons name="time" size={18} color="#D97706" />
          <Text style={styles.pendingBannerText}>
            Verification Pending. Viewing patient records is locked.
          </Text>
        </View>
      )}

      <View style={styles.searchWrapper}>
        <Input
          placeholder="Search patients by name or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
          clearButtonMode="while-editing"
        />
      </View>

      {showSkeleton ? (
        <View style={styles.listContainer}>
          <SkeletonList count={6} />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} message="Could not load patients list." />
      ) : filteredPatients.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No patients found"
          subtitle={
            searchQuery
              ? `No patients match "${searchQuery}"`
              : "You don't have any patients in your directory yet."
          }
        />
      ) : (
        <FlashList
          data={filteredPatients}
          keyExtractor={(item) => item.id}
          renderItem={renderPatientItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={_isLoading}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          // @ts-ignore - TS complains but this prop is required by FlashList
          estimatedItemSize={85}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  searchWrapper: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listContainer: {
    padding: Spacing[4],
    flexGrow: 1,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing[3],
    ...Shadows.xs,
  },
  infoContainer: {
    flex: 1,
    marginLeft: Spacing[3],
    gap: 4,
  },
  patientName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral[400],
    marginHorizontal: Spacing[2],
  },
  separator: {
    height: Spacing[3],
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: 8,
  },
  pendingBannerText: {
    fontSize: FontSize.xs,
    color: '#B45309',
    fontWeight: FontWeight.semiBold,
    flex: 1,
  },
});
