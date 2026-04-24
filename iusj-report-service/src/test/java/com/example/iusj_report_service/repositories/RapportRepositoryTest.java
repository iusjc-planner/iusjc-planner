package com.example.iusj_report_service.repositories;

import com.example.iusj_report_service.entities.Rapport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import org.springframework.test.context.TestPropertySource;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@TestPropertySource(properties = {
    "spring.flyway.enabled=false",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class RapportRepositoryTest {

    @Autowired
    private RapportRepository rapportRepository;

    private Rapport report1;
    private Rapport report2;

    @BeforeEach
    void setUp() {
        report1 = new Rapport();
        report1.setTitre("Report 1");
        report1.setType(Rapport.ReportType.OCCUPATION_SALLE);
        report1.setDateGeneration(LocalDateTime.now().minusDays(5));
        report1.setPeriodeDebut(LocalDate.now().minusDays(30));
        report1.setPeriodeFin(LocalDate.now());
        report1.setGenerePar(100L);
        report1.setFormat(Rapport.ReportFormat.PDF);
        report1.setStatus(Rapport.ReportStatus.TERMINE);

        report2 = new Rapport();
        report2.setTitre("Report 2");
        report2.setType(Rapport.ReportType.CHARGE_ENSEIGNANT);
        report2.setDateGeneration(LocalDateTime.now().minusDays(2));
        report2.setPeriodeDebut(LocalDate.now().minusDays(60));
        report2.setPeriodeFin(LocalDate.now());
        report2.setGenerePar(200L);
        report2.setFormat(Rapport.ReportFormat.EXCEL);
        report2.setStatus(Rapport.ReportStatus.EN_COURS);

        rapportRepository.saveAll(List.of(report1, report2));
    }

    @Test
    void testFindByType() {
        List<Rapport> found = rapportRepository.findByType(Rapport.ReportType.OCCUPATION_SALLE);
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getTitre()).isEqualTo("Report 1");
    }

    @Test
    void testFindByGenerePar() {
        List<Rapport> found = rapportRepository.findByGenerePar(200L);
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getTitre()).isEqualTo("Report 2");
    }

    @Test
    void testFindByDateGenerationBetween() {
        LocalDateTime start = LocalDateTime.now().minusDays(6);
        LocalDateTime end = LocalDateTime.now().minusDays(4);

        List<Rapport> found = rapportRepository.findByDateGenerationBetween(start, end);
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getTitre()).isEqualTo("Report 1");
        
        LocalDateTime startAll = LocalDateTime.now().minusDays(10);
        LocalDateTime endAll = LocalDateTime.now();
        
        List<Rapport> foundAll = rapportRepository.findByDateGenerationBetween(startAll, endAll);
        assertThat(foundAll).hasSize(2);
    }
}
