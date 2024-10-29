[ServiceContract]
interface IRetrieveWebContent
{
	[OperationContract]
	[WebGet(UriTemplate = "GetUserIp",
		ResponseFormat = WebMessageFormat.Json)]
	string GetIp();
}

// *************************

[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
public class RetrieveWebContent : IRetrieveWebContent
{
	public string GetIp()
	{
		string userIp = HttpContext.Current.Request.UserHostAddress;
		return userIp;
	}
}