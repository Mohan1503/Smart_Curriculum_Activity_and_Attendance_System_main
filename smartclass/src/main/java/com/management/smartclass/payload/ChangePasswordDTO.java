package com.management.smartclass.payload;

public class ChangePasswordDTO {

    private String oldpassword;
    private String newpassword;

    public ChangePasswordDTO() {
    }

    public ChangePasswordDTO(String newpassword, String oldpassword) {
        this.newpassword = newpassword;
        this.oldpassword = oldpassword;
    }

    public String getOldpassword() {
        return oldpassword;
    }

    public void setOldpassword(String oldpassword) {
        this.oldpassword = oldpassword;
    }

    public String getNewpassword() {
        return newpassword;
    }

    public void setNewpassword(String newpassword) {
        this.newpassword = newpassword;
    }
}
