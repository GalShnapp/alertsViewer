export interface AlertSummary {
    alert_name: string;
    cloudtrail_logs: CloudTrailLog[];
}

export interface CloudTrailLog {
    timestamp: string;
    event_name: string;
    user_identity: UserIdentity;
    source_ip: string;
    metadata: ResponseElements | RequestParameters;
}

export interface RequestParameters {
    params: BucketPolicyChangeRequestParams | InstanceStateChangeRequestParams;
}

export interface BucketPolicyChangeRequestParams {
    bucketName: string;
    policy: string;
}

export interface InstanceStateChangeRequestParams {
    instanceId: string;
    iamInstanceProfile: IamInstanceProfile;
}

export interface IamInstanceProfile {
    arn: string;
}

export interface UserIdentity {
    type: string;
    userName: string;
}

export interface ResponseElements {
    elements: UnauthorizedApiCallElements | SuspiciousLoginElements;
}

export interface UnauthorizedApiCallElements {
    instancesSet: InstancesSet;
    securityGroup: string
}

export interface SuspiciousLoginElements {
    ConsoleLogin: string;
}

export interface InstancesSet {
    items: Instance[];
}

export interface Instance {
    instanceId: string;
    currentState: string;
}

export const enumAlertType = {
    ALERT1: 'ALERT1' as const,
    ALERT2: 'ALERT2' as const,
    ALERT3: 'ALERT3' as const,
    ALERT4: 'ALERT4' as const,
};

export type AlertType = (typeof enumAlertType)[keyof typeof enumAlertType];
