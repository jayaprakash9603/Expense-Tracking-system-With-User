package com.jaya.task.user.service.service;

import com.jaya.task.user.service.dto.BillReportPreferenceDTO;
import com.jaya.task.user.service.model.BillReportPreference;
import com.jaya.task.user.service.repository.BillReportPreferenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportPreferenceServiceTest {

    @Mock
    private BillReportPreferenceRepository billRepository;

    @InjectMocks
    private BillReportPreferenceService billService;

    private BillReportPreference billPreference;

    @BeforeEach
    void setUp() {
        billPreference = new BillReportPreference(1, "[{\"id\":\"overview-cards\"}]");
        billPreference.setId(1L);
        billPreference.setCreatedAt(LocalDateTime.now());
        billPreference.setUpdatedAt(LocalDateTime.now());
    }

    @Nested
    class GetPreferences {

        @Test
        void returnsDtoWhenPreferenceExists() {
            when(billRepository.findByUserId(1)).thenReturn(Optional.of(billPreference));

            BillReportPreferenceDTO result = billService.getPreferences(1);

            assertThat(result).isNotNull();
            assertThat(result.getUserId()).isEqualTo(1);
            assertThat(result.getLayoutConfig()).contains("overview-cards");
        }

        @Test
        void returnsNullWhenNoPreferenceExists() {
            when(billRepository.findByUserId(99)).thenReturn(Optional.empty());

            BillReportPreferenceDTO result = billService.getPreferences(99);

            assertThat(result).isNull();
        }
    }

    @Nested
    class SavePreferences {

        @Test
        void createsNewPreference() {
            String config = "[{\"id\":\"new-layout\"}]";
            when(billRepository.findByUserId(2)).thenReturn(Optional.empty());
            when(billRepository.save(any(BillReportPreference.class)))
                    .thenAnswer(inv -> {
                        BillReportPreference p = inv.getArgument(0);
                        p.setId(2L);
                        p.setCreatedAt(LocalDateTime.now());
                        p.setUpdatedAt(LocalDateTime.now());
                        return p;
                    });

            BillReportPreferenceDTO result = billService.savePreferences(2, config);

            assertThat(result).isNotNull();
            assertThat(result.getLayoutConfig()).isEqualTo(config);
            verify(billRepository).save(any(BillReportPreference.class));
        }

        @Test
        void updatesExistingPreference() {
            String newConfig = "[{\"id\":\"updated\"}]";
            when(billRepository.findByUserId(1)).thenReturn(Optional.of(billPreference));
            when(billRepository.save(any(BillReportPreference.class)))
                    .thenAnswer(inv -> {
                        BillReportPreference p = inv.getArgument(0);
                        p.setUpdatedAt(LocalDateTime.now());
                        return p;
                    });

            BillReportPreferenceDTO result = billService.savePreferences(1, newConfig);

            assertThat(result).isNotNull();
            assertThat(result.getLayoutConfig()).isEqualTo(newConfig);
        }
    }

    @Nested
    class ResetPreferences {

        @Test
        void deletesPreferenceForUser() {
            billService.resetPreferences(1);

            verify(billRepository).deleteByUserId(1);
        }
    }

    @Nested
    class DefaultLayoutConfig {

        @Test
        void defaultConfigIsNotBlank() {
            assertThat(BillReportPreferenceService.DEFAULT_LAYOUT_CONFIG).isNotBlank();
        }

        @Test
        void defaultConfigContainsExpectedSections() {
            String config = BillReportPreferenceService.DEFAULT_LAYOUT_CONFIG;
            assertThat(config).contains("overview-cards");
            assertThat(config).contains("category-chart");
            assertThat(config).contains("bills-table");
        }
    }
}
