package asoc.api.controller;

import asoc.api.services.ActividadProgramadaService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    private final ActividadProgramadaService actividadService;

    public WebController(ActividadProgramadaService actividadService) {
        this.actividadService = actividadService;
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("actividades", actividadService.listarTodas());
        return "index";
    }
}
