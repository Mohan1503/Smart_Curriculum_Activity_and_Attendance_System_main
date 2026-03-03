package com.management.smartclass.controllers;


import com.management.smartclass.payload.ChangePasswordDTO;
import com.management.smartclass.payload.LoginDTO;
import com.management.smartclass.payload.SignUpDTO;
import com.management.smartclass.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody SignUpDTO signUpDTO){
        System.out.println(signUpDTO.getRole());
        String res = authService.register(signUpDTO);
        return ResponseEntity.ok(res);
    }
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }
    @PostMapping("/change-password")
    public ResponseEntity<String> changePass(Authentication auth, @RequestBody ChangePasswordDTO dto){
        return ResponseEntity.ok(authService.changePassword(auth.getName(),dto));
    }
}
