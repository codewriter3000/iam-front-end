"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  Column,
} from "@carbon/react";
import { useRef, useState, useEffect } from "react";
import { useCountUp } from "react-countup";
import { getRoles, getUsers } from "@/../lib";

export default function LandingPage() {
    const [realData, setRealData] = useState([])
    const [roles, setRoles] = useState([])

    useEffect(() => {
        getUsers().then((data) => {
            setRealData(data)
            userCountUp.update(data.length)
        })
        getRoles().then((data) => {
            setRoles(data)
            roleCountUp.update(data.length)
        })
    }, [])

    const userCountUpRef = useRef(null)
    const userCountUp = useCountUp({
        ref: userCountUpRef,
        end: realData.length
    })

    const roleCountUpRef = useRef(null)
    const roleCountUp = useCountUp({
        ref: roleCountUpRef,
        end: roles.length
    })

    const permissionCountUpRef = useRef(null)
    const permissionCountUp = useCountUp({
        ref: permissionCountUpRef,
        end: realData.length
    })

    const applicationCountUpRef = useRef(null)
    const applicationCountUp = useCountUp({
        ref: applicationCountUpRef,
        end: realData.length
    })

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem>
            <a href="/">Dashboard</a>
          </BreadcrumbItem>
        </Breadcrumb>
        <h1 className="landing-page__heading">
          Manage your organization with the Identity & Access Manager
        </h1>
      </Column>
      <Column className="mt-6 mb-4" lg={16} md={8} sm={4}>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <h2 className="metric">
              <span ref={userCountUpRef} />
            </h2>
            <p>Users</p>
          </div>
          <div>
            <h2 className="metric">
              <span ref={roleCountUpRef} />
            </h2>
            <p>Roles</p>
          </div>
          <div>
            <h2 className="metric">
              <span ref={permissionCountUpRef} />
            </h2>
            <p>Permissions</p>
          </div>
          <div>
            <h2 className="metric">
                <span ref={applicationCountUpRef} />
            </h2>
            <p>Applications</p>
          </div>
        </div>
      </Column>
    </Grid>
  );
}
