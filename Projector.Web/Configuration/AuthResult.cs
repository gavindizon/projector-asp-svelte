using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Projector.Web.Configuration
{
    public class AuthResult
    {
        public String Token { get; set; }
        public bool success { get; set; }
        public List<string> Errors { get; set; }
    }
}
