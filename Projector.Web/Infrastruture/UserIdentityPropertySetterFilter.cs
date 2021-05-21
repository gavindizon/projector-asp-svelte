using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace Projector.Web.Infrastruture
{
    public class UserIdentityPropertySetterFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            //object model = context.ActionArguments 
            object incomingModel = new SampleModel
            {

            };

            // get all properties that are decorated with the interesting attribute
            Type modelType = incomingModel.GetType();
            var decoratedProperties = modelType.GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
                .Where(props => props.GetCustomAttributes(typeof(UserIdentityPropertyAttribute), true).Any());

            foreach (var prop in decoratedProperties)
            {
                var attribute = prop.GetCustomAttributes(typeof(UserIdentityPropertyAttribute), true)
                    .Select(p => p as UserIdentityPropertyAttribute)
                    .Single();

                switch (attribute.SourceProperty)
                {
                    case "Name":
                        prop.SetValue(incomingModel, context.HttpContext.User.Identity.Name);
                        break;
                }
            }

            //context.ActionArguments.Mode
            base.OnActionExecuting(context);
        }

        class SampleModel
        {
            public string createdBy { get; set; }
        }
    }
}
