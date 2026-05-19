import React from 'react';
import * as allIcons from '@ant-design/icons';
import type { V1Menu, V1PermissionRequirement } from '@gosaas/api';
import Iframe from '@/components/Iframe';
import MicroApp from '@/components/MicroApp';
import { MasterOptions } from '@@/plugin-qiankun-master/types';
import { getMasterOptions } from '@@/plugin-qiankun-master/masterOptions';
import { patchMicroAppRoute } from '@@/plugin-qiankun-master/common';
import { getPermission, isGrant } from '@gosaas/core';

const isDev = process.env.NODE_ENV === 'development';

type MenuDataItem = {
  [key: string]: any;
  children?: MenuDataItem[];
  hideInMenu?: boolean;
  icon?: React.ReactNode;
  key?: string;
  locale?: string;
  microApp?: string;
  name?: string;
  path?: string;
  redirect?: string;
};

export declare type RouteData = {
  type: 'iframe' | 'microApp';
  iframe?: string;
  microAppName?: string;
  microAppEntry?: string;
  microAppBasename?: string;
};

export declare type Route = {
  route?: RouteData;
} & Omit<MenuDataItem, 'children'> & {
    requirement?: V1PermissionRequirement[] | undefined;
    children?: Route[];
  } & {
    element?: React.ReactNode;
  };

export function transformMenu(allMenu: V1Menu[]) {
  const { routeBindingAlias, base, masterHistoryType } = getMasterOptions() as MasterOptions;
  const aclList = getPermission()?.values ?? [];

  const isAllowed = (requirement?: V1PermissionRequirement[]) => {
    if (requirement && requirement.length > 0) {
      if (!aclList.length) {
        return false;
      }
      return isGrant(requirement, aclList);
    }
    return true;
  };

  const shouldRender = (menu: V1Menu) => {
    if (menu.ignoreAuth) {
      return true;
    }
    return isAllowed(menu.requirement);
  };

  const findChildren = (id: string): Route[] => {
    const items: Route[] = allMenu
      .filter((p) => p.parent === id)
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
      .map((p) => {
        if (!shouldRender(p)) {
          return null;
        }
        const item: Route = {
          icon: p.icon,
          locale: p.title,
          name: p.title,
          path: p.path,
          //component: p.component,
          requirement: p.requirement,
          key: p.id,
          hideInMenu: p.hideInMenu,
        };
        if (p.iframe) {
          item.route = {
            type: 'iframe',
            iframe: p.iframe!,
          };
          item.element = <Iframe key={p.id!} frameSrc={p.iframe!} />;
        }
        if (p.microAppName) {
          const entry = isDev ? p.microAppDev : p.microApp;
          item.route = {
            //meta just for app.tsx qiankun() function
            microAppName: p.microAppName,
            microAppEntry: entry,
            microAppBasename: p.microAppBaseRoute,
            type: 'microApp',
          };
          if (p.microAppBaseRoute) {
            item.element = (
              <MicroApp
                key={p.id!}
                name={p.microAppName}
                url={p.microAppBaseRoute!}
                entry={entry!}
              />
            );
          } else {
            item.microApp = p.microAppName;
            //see @@/plugin-qiankun-master/masterRuntimePlugin.tsx#L57
            patchMicroAppRoute(
              item as any,
              {
                base,
                masterHistoryType,
                routeBindingAlias,
              } as any,
            );
          }
        }

        //fix icon
        const icon = p.icon;
        if (typeof icon === 'string') {
          item.icon = React.createElement(allIcons[icon] || allIcons.AppstoreOutlined);
        }
        return item;
      })
      .filter((item): item is Route => item !== null);

    for (const i of items) {
      i.children = findChildren(i.key);
      if (i.children.length === 0) {
        i.children = undefined;
      }
    }
    return items;
  };
  const ret = findChildren('');
  return ret;
}
