package com.management.smartclass.services;

import com.management.smartclass.Repos.NotificationRepo;
import com.management.smartclass.models.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepo notificationRepo;

    public Notification sendNotification(String title, String message, String targetEmail) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setTargetEmail(targetEmail);
        notification.setSentAt(LocalDateTime.now());
        notification.setRead(false);
        return notificationRepo.save(notification);
    }

    public List<Notification> getMyNotifications(String email) {
        return notificationRepo.findByTargetEmailOrderBySentAtDesc(email);
    }
}
