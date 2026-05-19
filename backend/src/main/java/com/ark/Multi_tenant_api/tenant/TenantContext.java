package com.ark.Multi_tenant_api.tenant;

public class TenantContext {

    public static ThreadLocal<String>  currentTenant = new ThreadLocal<>();

    public static String getCurrentOrgId(){
        return currentTenant.get();
    }
    public static void setCurrentOrgId(String orgId){
        currentTenant.set(orgId);
    }
    public static void clear(){
        currentTenant.remove();
    }

}
