using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Projector.Web.Controllers.Api
{

    [Authorize]
    [Area("Api")]
    [Route("[area]/[controller]")]
    public class SessionController : Controller
    {
        public ActionResult<SessionData> Index() 
        {
            var username = this.User.Identity.Name;

            if (username == null)
                return BadRequest();

            return new SessionData 
            {
                username = this.User.Identity.Name,

                AccessibleNavItems = new List<MenuAccessRightData>
                {
                    new MenuAccessRightData {
                        ClientRoute = "/app/projects",
                        Label = "Add Project",
                        ClientAction = true,

                    },
                    new MenuAccessRightData
                    {
                        ClientRoute = "/app/people",
                        Label = "Add People",
                        ClientAction = true,
                    },
                    new MenuAccessRightData
                    {

                        ClientRoute = "/",
                        Label = "Logout",
                        Style = "btn; btn--primary",
                        ClientAction = false,

                    }
                }
            };
        }

        public class SessionData
        {

            public string username {get;set;}
            public string NickName {get; set;}
            public List<MenuAccessRightData> AccessibleNavItems {get;set;}
        }

        public class MenuAccessRightData
        {
            public string ClientRoute {get; set;}
            public string Label { get; set; }
            public string Style { get; set; }
            public bool ClientAction { get; set; }
        }
    }
}