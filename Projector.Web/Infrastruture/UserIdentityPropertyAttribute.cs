using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Projector.Web
{
    [AttributeUsage(AttributeTargets.Property)]
    public class UserIdentityPropertyAttribute : Attribute
    {
        public UserIdentityPropertyAttribute(string sourceProperty)
        {
            this.SourceProperty = sourceProperty;
        }

        public string SourceProperty { get; set; }
    }
}
