using System.Web.Mvc;

namespace CrearUsuarioForm.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult FormularioHTML()
        {
            ViewBag.Message = "Formulario HTML con ASP.NET";
            return View();
        }

        [HttpPost]
        public ActionResult FormularioHTML(string nombre, string correo, string contrasena, string contrasena_r)
        {
            ViewBag.Message = "Recibiendo los valores del formulario. ";
            ViewBag.Message += "Nombre: " + nombre + ", ";
            ViewBag.Message += "Correo: " + correo + ", ";
            ViewBag.Message += "Contraseña: " + contrasena + ", ";
            ViewBag.Message += "Confirmación C: " + contrasena_r;

            if(contrasena != contrasena_r)
            {
                ViewBag.Alert = " ***** Las contraseñas no coinciden *****";
                ViewBag.AlertType = "warning";
            }
            else
            {
                ViewBag.Alert = " ***** Informacióin enviada correctamente *****";
                ViewBag.AlertType = "success";
            }

            return View();
        }

        public ActionResult FormularioCollection()
        {
            ViewBag.Message = "Formulario HTML Con ASP.NET. Método. FormCollection";
            return View();
        }
    }
}