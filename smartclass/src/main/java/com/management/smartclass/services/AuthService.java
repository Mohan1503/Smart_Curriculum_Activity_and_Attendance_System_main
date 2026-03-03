package com.management.smartclass.services;

import com.management.smartclass.Repos.UserRepo;
import com.management.smartclass.models.Users;
import com.management.smartclass.payload.ChangePasswordDTO;
import com.management.smartclass.payload.LoginDTO;
import com.management.smartclass.payload.SignUpDTO;
import com.management.smartclass.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepo userRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    public String register(SignUpDTO dto){
        try {
            Users user = new Users();
            user.setEmail(dto.getEmail());
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setRole(dto.getRole());
            user.setFirstlogin(false);
            userRepo.save(user);
            return "User saved Successfully.";
        }catch (Exception e){
            return e.getMessage();
        }
    }
    public String login(LoginDTO dto) {

        Users user = userRepo.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return token;
    }

    public String changePassword(String email, ChangePasswordDTO dto) {

        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));




        if (!passwordEncoder.matches(dto.getOldpassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }


        if (passwordEncoder.matches(dto.getNewpassword(), user.getPassword())) {
            throw new RuntimeException("New password cannot be same as old password");
        }


        user.setPassword(passwordEncoder.encode(dto.getNewpassword()));


        user.setFirstlogin(false);

        userRepo.save(user);

        return "Password changed successfully";
    }
}
