package com.management.smartclass.payload;
public class QrScanDTO {
    private String token;

    public QrScanDTO() {
    }

    public QrScanDTO(String token) {
        this.token = token;

    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}

