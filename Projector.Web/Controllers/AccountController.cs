using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebAPI.Dtos;
using WebAPI.Helpers;
using WebAPI.Models;

using Projector.Web.Configuration;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;

namespace Projector.Web.Controllers
{
    public class AccountController : Controller
    {

        private readonly ProjectorDBContext _context;
        //private readonly JwtService _jwtService;
        private readonly JwtConfig _jwtConfig;


        public AccountController(ProjectorDBContext context, IOptionsMonitor<JwtConfig> optionsMonitor)
        {
            _context = context;
            _jwtConfig = optionsMonitor.CurrentValue;
        }

        [HttpGet]
        public ActionResult SignIn()
        {
            if (Request.Cookies["Cookie"] != null)
                return RedirectToRoute("App");
            return View();
        }


        [HttpPost]
        public async Task<IActionResult> SignIn(LoginDto dto)
        {
            // setup clais
            var user = _context.Persons.FirstOrDefault(p => p.username == dto.username);
            if (user == null || user.password != dto.password)
                return RedirectToRoute("App");

            var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.first_name),
                    new Claim("Id", user.id.ToString()),
                    new Claim(ClaimTypes.Role, "User"),
                };
            var claimsIdentity = new ClaimsIdentity(
                claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                ExpiresUtc = DateTime.Now.AddMinutes(50),
            };
            await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            authProperties);

            return RedirectToRoute("App");

        }

        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("SignIn");
        }
    }
}
