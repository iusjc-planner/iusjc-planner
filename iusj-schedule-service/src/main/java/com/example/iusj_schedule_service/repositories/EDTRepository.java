package com.example.iusj_schedule_service.repositories;

import com.example.iusj_schedule_service.entities.EDT;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EDTRepository extends JpaRepository<EDT, Long> {

    List<EDT> findBySemaineAndAnnee(Integer semaine, Integer annee);

    List<EDT> findByVueAndTargetId(EDT.VueType vue, Long targetId);

    Optional<EDT> findBySemaineAndAnneeAndVueAndTargetId(Integer semaine, Integer annee, EDT.VueType vue, Long targetId);

    List<EDT> findByStatus(EDT.EDTStatus status);

    List<EDT> findByPeriodeAndAnnee(EDT.PeriodeType periode, Integer annee);
}
