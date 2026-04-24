package com.example.iusj_resource_service.repositories;

import com.example.iusj_resource_service.entities.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {

    long countByStatut(Resource.StatutRessource statut);
}
