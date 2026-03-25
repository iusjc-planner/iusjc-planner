package com.example.iusj_course_service.services;

import com.example.iusj_course_service.entities.Matiere;
import com.example.iusj_course_service.entities.Support;
import com.example.iusj_course_service.repositories.MatiereRepository;
import com.example.iusj_course_service.repositories.SupportRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SupportService {

    private final SupportRepository supportRepository;
    private final MatiereRepository matiereRepository;

    public SupportService(SupportRepository supportRepository, MatiereRepository matiereRepository) {
        this.supportRepository = supportRepository;
        this.matiereRepository = matiereRepository;
    }

    public List<Support> getByMatiereId(Long matiereId) {
        return supportRepository.findByMatiereId(matiereId);
    }

    public Support getById(Long id) {
        return supportRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Support non trouve avec id " + id));
    }

    public Support create(Long matiereId, Support support, Long currentUserId, String currentRole) {
        Matiere matiere = matiereRepository.findById(matiereId)
            .orElseThrow(() -> new EntityNotFoundException("Matiere non trouvee avec id " + matiereId));

        enforceWritePermission(matiere, currentUserId, currentRole);

        support.setId(null);
        support.setMatiereId(matiereId);
        if (support.getUploadePar() == null) {
            support.setUploadePar(currentUserId);
        }
        if (support.getType() == null) {
            support.setType(detectTypeFromUrl(support.getUrl()));
        }
        return supportRepository.save(support);
    }

    public Support update(Long id, Support support, Long currentUserId, String currentRole) {
        Support existing = getById(id);
        Matiere matiere = matiereRepository.findById(existing.getMatiereId())
            .orElseThrow(() -> new EntityNotFoundException("Matiere non trouvee avec id " + existing.getMatiereId()));

        enforceWritePermission(matiere, currentUserId, currentRole);

        support.setId(id);
        support.setMatiereId(existing.getMatiereId());
        if (support.getUploadePar() == null) {
            support.setUploadePar(existing.getUploadePar());
        }
        if (support.getDateAjout() == null) {
            support.setDateAjout(existing.getDateAjout());
        }
        if (support.getType() == null) {
            support.setType(detectTypeFromUrl(support.getUrl()));
        }
        return supportRepository.save(support);
    }

    public void delete(Long id, Long currentUserId, String currentRole) {
        Support support = getById(id);
        Matiere matiere = matiereRepository.findById(support.getMatiereId())
            .orElseThrow(() -> new EntityNotFoundException("Matiere non trouvee avec id " + support.getMatiereId()));

        enforceWritePermission(matiere, currentUserId, currentRole);
        supportRepository.deleteById(id);
    }

    public void deleteByMatiereId(Long matiereId) {
        supportRepository.deleteByMatiereId(matiereId);
    }

    private void enforceWritePermission(Matiere matiere, Long currentUserId, String currentRole) {
        if (currentRole != null && "ADMIN".equalsIgnoreCase(currentRole)) {
            return;
        }
        if (currentRole != null && "ENSEIGNANT".equalsIgnoreCase(currentRole)
                && currentUserId != null
                && currentUserId.equals(matiere.getTeacherId())) {
            return;
        }
        throw new IllegalArgumentException("Acces refuse: seul l'enseignant de la matiere ou un admin peut modifier les supports");
    }

    private Support.SupportType detectTypeFromUrl(String url) {
        if (url == null) {
            return Support.SupportType.AUTRE;
        }
        String value = url.toLowerCase();
        if (value.endsWith(".pdf")) {
            return Support.SupportType.PDF;
        }
        if (value.endsWith(".mp4") || value.endsWith(".avi") || value.endsWith(".mkv") || value.contains("youtube")) {
            return Support.SupportType.VIDEO;
        }
        if (value.endsWith(".doc") || value.endsWith(".docx") || value.endsWith(".ppt") || value.endsWith(".pptx")) {
            return Support.SupportType.DOCUMENT;
        }
        if (value.endsWith(".png") || value.endsWith(".jpg") || value.endsWith(".jpeg") || value.endsWith(".gif")) {
            return Support.SupportType.IMAGE;
        }
        if (value.startsWith("http://") || value.startsWith("https://")) {
            return Support.SupportType.LIEN;
        }
        return Support.SupportType.AUTRE;
    }
}
