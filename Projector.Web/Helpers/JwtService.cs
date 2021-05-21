using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebAPI.Helpers
{
    public class JwtService
    {
        private string key = "supercalifragilisticexpialidocious";
        public string Generate(int id)
        {
            var symmSecKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

//            var securityToken = new JwtSecurityToken(header, payload);




            var credentials = new SigningCredentials(symmSecKey, SecurityAlgorithms.HmacSha256Signature);
            var header = new JwtHeader(credentials);
           // var payload = new JwtPayload(,)
            var payload = new JwtPayload(id.ToString(), null, null, null, DateTime.Today.AddDays(1));
            var securityToken = new JwtSecurityToken(header, payload);


            return new JwtSecurityTokenHandler().WriteToken(securityToken);
        }


        public JwtSecurityToken Verify(string jwt)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var verifyKey = Encoding.ASCII.GetBytes(key);
            tokenHandler.ValidateToken(jwt, new TokenValidationParameters { 
                IssuerSigningKey = new SymmetricSecurityKey(verifyKey),
                ValidateIssuerSigningKey = true,
                ValidateIssuer = false,
                ValidateAudience = false
            }, out SecurityToken validatedToken);

            return (JwtSecurityToken) validatedToken;
        }
    }
}
